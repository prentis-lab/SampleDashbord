#!/usr/bin/env python3
"""
Convert any CSV or Excel file to a UTF-8 encoded CSV.
Usage:
    python3 convert_to_utf8.py <input_file> [output_file]

If output_file is omitted, the input file is overwritten in-place.
Supported input formats: .csv, .xlsx, .xls
Excel files require pandas: pip3 install pandas openpyxl
"""

import sys
import csv
import pathlib

ENCODINGS_TO_TRY = ["utf-8", "latin-1", "cp1252", "mac_roman"]


def read_csv(path: pathlib.Path):
    for enc in ENCODINGS_TO_TRY:
        try:
            with open(path, newline="", encoding=enc) as f:
                rows = list(csv.reader(f))
            print(f"  Detected encoding: {enc}")
            return rows
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Could not decode {path} with any of: {ENCODINGS_TO_TRY}")


def read_excel(path: pathlib.Path):
    try:
        import pandas as pd
    except ImportError:
        print("ERROR: pandas is required for Excel files.")
        print("Install it with: pip3 install pandas openpyxl")
        sys.exit(1)

    xl = pd.ExcelFile(path)
    if len(xl.sheet_names) > 1:
        print(f"  Sheets found: {xl.sheet_names}")
        sheet = input(f"  Which sheet to convert? [{xl.sheet_names[0]}]: ").strip()
        sheet = sheet or xl.sheet_names[0]
    else:
        sheet = xl.sheet_names[0]
    print(f"  Using sheet: {sheet}")
    df = pd.read_excel(path, sheet_name=sheet)
    rows = [df.columns.tolist()] + df.values.tolist()
    return [[str(v) if v is not None else "" for v in row] for row in rows]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_path  = pathlib.Path(sys.argv[1])
    output_path = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else input_path

    if not input_path.exists():
        print(f"ERROR: File not found: {input_path}")
        sys.exit(1)

    suffix = input_path.suffix.lower()
    print(f"Reading: {input_path}")

    if suffix in (".xlsx", ".xls"):
        rows = read_excel(input_path)
    elif suffix == ".csv":
        rows = read_csv(input_path)
    else:
        print(f"ERROR: Unsupported file type '{suffix}'. Supported: .csv, .xlsx, .xls")
        sys.exit(1)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(rows)

    print(f"Saved UTF-8 CSV: {output_path} ({len(rows) - 1} rows, {len(rows[0])} columns)")


if __name__ == "__main__":
    main()
