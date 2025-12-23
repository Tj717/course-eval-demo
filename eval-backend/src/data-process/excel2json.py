import sys
import re
import json
import pandas as pd
import warnings
import os
from datetime import datetime

warnings.filterwarnings('ignore', category=FutureWarning)

def split_course_and_instructor(input_string):
    input_string = input_string.strip()
    parts = re.split(r"\s+", input_string)

    if len(parts) >= 4:
        school, course, section, instructor = parts[0], parts[1], parts[2], " ".join(parts[3:])
    else:
        school, course, instructor = parts[0], parts[1], " ".join(parts[2:])
        section = ""

    course_number = f"{school} {course}"
    return course_number, section, instructor.strip()


def load_and_preprocess_data(sheet, year, term):
    df = sheet.set_index(sheet.columns[0]).T
    term_number = {"W1": 1, "W2": 2, "S1": 3}.get(term, None)
    term_average = df.get("Average", {}).get("Overall Means/Total", 0)

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
    for idx in df.index:
        course, section, instructor = split_course_and_instructor(idx)
        course_id = f"{course} {section}" if section else course
        if idx == "Overall Means/Total":
            course_id = "Overall Means/Total"
            course = instructor = section = ""
        df.at[idx, 'Course_ID'] = course_id
        df.at[idx, 'Course_Number'] = course
        df.at[idx, 'Section_Number'] = section
        df.at[idx, 'Instructor'] = instructor
    return df


def extract_year_term(text):
    month_to_term = {'aug': 'S1', 'jul': 'S1', 'apr': 'W2', 'dec': 'W1'}
    match = re.search(r'(aug|jul|apr|dec)(\d{2})', text.lower())
    if match:
        month_abbr, yr = match.groups()
        year = 2000 + int(yr)
        term = month_to_term[month_abbr]
        if term == 'W2': year -= 1
        return year, term
    return None, None


def main():
    if len(sys.argv) < 2:
        print("Usage: python excel2json.py <excel_file>", file=sys.stderr)
        sys.exit(1)

    excel_file = sys.argv[1]
    try:
        sheets = pd.ExcelFile(excel_file).sheet_names
    except Exception as e:
        print(f"[ERROR] Cannot read Excel file: {e}", file=sys.stderr)
        sys.exit(1)

    output = {}
    for sheet_name in sheets:
        df_raw = pd.read_excel(excel_file, sheet_name=sheet_name)
        year, term = extract_year_term(sheet_name)
        processed = load_and_preprocess_data(df_raw, year, term)
        processed = process_course_instructor(processed)
        processed = processed.applymap(lambda x: round(x, 2) if isinstance(x, (int, float)) else x)
        processed = processed.where(pd.notnull(processed), None)
        output[sheet_name] = processed.to_dict(orient='records')

    # save into existing './output' directory
    output_dir = os.path.join(os.getcwd(), "output")
    # create timestamped, versioned filename
    ts = datetime.now().strftime("%Y%m%dT%H%M%S")
    existing = [f for f in os.listdir(output_dir) if f.startswith(ts)]
    version = len(existing) + 1
    filename = f"{ts}_v{version}.json"
    path = os.path.join(output_dir, filename)

    with open(path, 'w') as f:
        json.dump(output, f)
    print(path)

if __name__ == "__main__":
    main()