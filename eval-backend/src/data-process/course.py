import os
import json
import argparse
from pymongo import MongoClient

# ----------------------------------------------------------------------------
# Script: courses.py
# Connects to MongoDB, aggregates course-instructor-term data, and
# writes output JSON into ./data/courses.json (overwriting any existing file).
# ----------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate courses.json from MongoDB data"
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
        '--output-dir',
        help='Directory where courses.json will be written'
    )
    parser.add_argument('--mongo-uri', required=True)
    return parser.parse_args()


def main():
    args = parse_args()

    # Ensure output directory exists
    os.makedirs(args.output_dir, exist_ok=True)

    # Connect to MongoDB
    mongo_uri = args.mongo_uri
    client = MongoClient(mongo_uri)
    db = client[args.db]
    col = db[args.collection]

    courses = {}

    for doc in col.find():
        course_name = doc.get('Course_Number') or ''
        instr_name = doc.get('Instructor') or ''
        year = doc.get('Year')
        term = doc.get('Term')

        # Clean term if quoted
        if isinstance(term, str) and term.startswith('"') and term.endswith('"'):
            term = term[1:-1]

        course_name = course_name.strip()
        if not course_name:
            continue

        time = f"{year} {term}" if year and term else None

        # Aggregate
        courses.setdefault(course_name, {}).setdefault(instr_name, [])
        if time and time not in courses[course_name][instr_name]:
            courses[course_name][instr_name].append(time)

    # Prepare JSON structure
    output_list = []
    for course, instructors in courses.items():
        instr_list = []
        for instr, times in instructors.items():
            instr_list.append({
                'instructor_name': instr,
                'times': sorted(times)
            })
        output_list.append({
            'course_name': course,
            'instructors': instr_list
        })

    # Write fixed filename
    out_path = os.path.join(args.output_dir, 'courses.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output_list, f, indent=2, ensure_ascii=False)

    print(f"Written courses data to {out_path}")


if __name__ == '__main__':
    main()
