import openpyxl
import sys

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook(r'23130064_TruongCaoDoan\Group13_23130064_TruongCaoDoan.xlsx', data_only=True)

def print_sheet(name):
    ws = wb[name]
    print(f"\n--- {name} ---")
    for r in range(1, ws.max_row + 1):
        row_vals = [str(ws.cell(row=r, column=c).value or '').strip() for c in range(1, ws.max_column + 1)]
        if any(row_vals):
            print(f"R{r}: " + " | ".join(row_vals[:9]))

print_sheet('Test case List')
print_sheet('Test Report')

