import os
import json
import argparse
from pymongo import MongoClient

# ----------------------------------------------------------------------------
# Script: instructors.py
# Connects to MongoDB, aggregates instructor-course-term data, and
# writes output JSON into ./data/instructors.json (overwriting any existing file).
# ----------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate instructors.json from MongoDB data"
    )
    parser.add_argument(
        '--db', required=True,
        help='Database name'
    )
    parser.add_argument(
        '--collection', required=True,
        help='Collection name containing evaluation documents'
    )
    parser.add_argument(
        '--output-dir'
    )
    parser.add_argument('--mongo-uri', required=True)
    return parser.parse_args()


def main():
    args = parse_args()

    # Ensure output directory exists
    os.makedirs(args.output_dir, exist_ok=True)

    mongo_uri = args.mongo_uri
    # Connect to MongoDB
    client = MongoClient(mongo_uri)
    db = client[args.db]
    col = db[args.collection]

    instructors = {}

    for doc in col.find():
        course = doc.get('Course_Number')
        instr = doc.get('Instructor') or ''
        year = doc.get('Year')
        term = doc.get('Term')

        # Skip missing instructor names
        instr = instr.strip()
        if not instr:
            continue

        # Build time string
        time = f"{year} {term}" if year and term else None

        # Aggregate
        instructors.setdefault(instr, {}).setdefault(course, [])
        if time and time not in instructors[instr][course]:
            instructors[instr][course].append(time)

    # Prepare JSON structure
    output_list = []
    for instr_name, courses in instructors.items():
        course_list = []
        for course_name, times in courses.items():
            course_list.append({
                'course_name': course_name,
                'times': sorted(times)
            })
        output_list.append({
            'instructor_name': instr_name,
            'courses': course_list
        })

    # Write fixed filename
    out_path = os.path.join(args.output_dir, 'instructors.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output_list, f, indent=2, ensure_ascii=False)

    print(f"Written instructors data to {out_path}")


if __name__ == '__main__':
    main()
