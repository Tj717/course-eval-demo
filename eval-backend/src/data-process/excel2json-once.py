import pandas as pd
import re
import json
import os
from pymongo import MongoClient

# Path to keep track of which sheets we’ve already run
META_FILE = "processed_sheets.json"

def load_processed_sheets():
    """
    Returns a list of sheet names we’ve already processed.
    If the file doesn’t exist (or is invalid), returns an empty list.
    """
    try:
        with open(META_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_processed_sheets(processed):
    """
    Overwrites META_FILE with the updated list of processed sheets.
    """
    with open(META_FILE, 'w', encoding='utf-8') as f:
        json.dump(processed, f, indent=4)


def split_course_and_instructor(input_string):
    input_string = input_string.strip()
    # Split the string by spaces
    parts = re.split(r'\s+', input_string)

    # If there are more than 3 parts, the instructor's name is everything after the section
    if len(parts) >= 4:
        school, course, section, instructor = parts[0], parts[1], parts[2], "".join(parts[3:])
    else:
        school, course, instructor = parts[0], parts[1], "".join(parts[2:])
        section = ""
    
    course_number = school + " " + course
    # instructor = format_name(instructor.replace(" ", ""))

    return course_number, section, instructor.strip()

def load_and_preprocess_data(sheet, year, term):
    # df = pd.read_excel(filename, header=None)
    df = sheet.set_index(sheet.columns[0]).T

    term_number = {"W1": 1, "W2": 2, "S1": 3}.get(term, None)
    term_average = df["Average"].get("Overall Means/Total", 0)
    # term_average = df.loc["Overall Means/Total", "Average"]

    df.insert(0, 'Course_ID', '')
    df.insert(1, 'Course_Number', '')
    df.insert(2, 'Section_Number', '')
    df.insert(3, 'Instructor', '')
    df.insert(4, 'Year', year)
    df.insert(5, 'Term', term)
    df.insert(6, 'Term_Number', term_number)
    df.insert(7, 'Term_Average', term_average)

    return df

def process_course_instructor(df):
    for index in df.index:
        course, section, instructor = split_course_and_instructor(index)
        if section != "":
            course_id = course + " " + section
        else:
            course_id = course

        if (index == "Overall Means/Total"):
            course_id = "Overall Means/Total"
            course = instructor = section = " "

        df.at[index, "Course_ID"] = course_id
        df.at[index, 'Course_Number'] = course
        df.at[index, 'Section_Number'] = section
        df.at[index, 'Instructor'] = instructor
    return df

def save_data(df, filename):
    """
    Saves a DataFrame to a JSON file, appending to existing data.
    Input: DataFrame (pd.DataFrame), filename (str)
    Output: None
    """
    df = df.map(lambda x: round(x, 2) if isinstance(x, (int, float)) else x)

    # Convert DataFrame to JSON records
    records = json.loads(df.to_json(orient="records", force_ascii=False))
    
    try:
        # Try to load existing data
        with open(filename, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # If the file doesn't exist or is empty/invalid, start with an empty list
        existing_data = []
    
    # Append the new records to the existing data
    existing_data.extend(records)
    
    # Write the combined data back to the file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, indent=4, ensure_ascii=False)

def process_sheet(sheet, year, term):
    df = load_and_preprocess_data(sheet, year, term)
    df = process_course_instructor(df)
    return df

def extract_year_term(text):
    # Define a mapping from allowed months to terms
    month_to_term = {
        'aug': 'S1',  
        'jul': 'S1',  
        'apr': 'W2',  
        'dec': 'W1'   
    }
    
    # Regular expression to match the month abbreviation followed by the two-digit year
    match = re.search(r'(aug|jul|apr|dec)(\d{2})', text.lower())

    if match:
        month_abbr, year_digits = match.groups()

        # Convert the two-digit year to four-digit format
        year = 2000 + int(year_digits)

        # Get the term based on the month
        term = month_to_term[month_abbr]
        if (term == 'W2'): year = year - 1 

        return year, term
    else:
        return None, None

def main():
    """
    Main function to orchestrate the Excel to JSON conversion process.
    It reads data from an Excel file, processes each sheet, and saves the processed data to a JSON file.
    """
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    OUTPUT_DIR = os.path.join(BASE_DIR, "output")
    output_json = os.path.join(OUTPUT_DIR, "output3.json")

    excel_file = "testAA.xlsx"
    processed = load_processed_sheets()

    all_sheets = pd.ExcelFile(excel_file).sheet_names
    new_sheets = [s for s in all_sheets if s not in processed]

    if not new_sheets:
        print("No new sheets to process. Exiting.")
        return
    
    for sheet_name in new_sheets:
        print(f"Processing sheet: {sheet_name}")
        year, term = extract_year_term(sheet_name)
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        processed_df = process_sheet(df, year, term)
        save_data(processed_df, output_json)

        processed.append(sheet_name)

    # after all new sheets are done, save the updated list
    save_processed_sheets(processed)
    print(f"Finished. Sheets added: {new_sheets}")


if __name__ == "__main__":
    main()
