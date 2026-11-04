import openpyxl
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook(r'23130064_TruongCaoDoan\Group13_23130064_TruongCaoDoan.xlsx', data_only=True)

# 1. Collect all Test Case IDs from Excel
modules = {
    'orders': {'sheet': 'Admin - Orders', 'excel_tcs': [], 'script': r'23130064_TruongCaoDoan\script\orders.spec.js'},
    'shipments': {'sheet': 'Admin - Shipments', 'excel_tcs': [], 'script': r'23130064_TruongCaoDoan\script\shipments.spec.js'},
    'giftcards': {'sheet': 'Admin - Gift cards', 'excel_tcs': [], 'script': r'23130064_TruongCaoDoan\script\giftcards.spec.js'}
}

for mod, info in modules.items():
    ws = wb[info['sheet']]
    # Find TC ID column
    tc_col = None
    for c in range(1, ws.max_column + 1):
        for r in range(1, 10):
            val = str(ws.cell(row=r, column=c).value or '').strip()
            if 'Test Case ID' in val or 'Testcase ID' in val or 'TC ID' in val:
                tc_col = c
                header_row = r
                break
        if tc_col:
            break
    
    print(f"\n[{mod.upper()}] Sheet: {info['sheet']}, TC Col: {tc_col}")
    if tc_col:
        for r in range(header_row + 1, ws.max_row + 1):
            val = str(ws.cell(row=r, column=tc_col).value or '').strip()
            if val and re.search(r'sales|ord|ship|gc|tc', val, re.I):
                desc = str(ws.cell(row=r, column=tc_col + 1).value or '').strip()
                info['excel_tcs'].append((val, desc))
    print(f"Total TCs in Excel: {len(info['excel_tcs'])}")

# 2. Collect all tests from .spec.js files
for mod, info in modules.items():
    script_path = info['script']
    info['script_tests'] = []
    if os.path.exists(script_path):
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Match test('...', test("...", test(`...`
        # Matches patterns like test('sales_ord_01: ...' or test('TC_...
        matches = re.findall(r"(?:test|test\.only|test\.skip)\s*\(\s*['\"`](.*?)['\"`]", content)
        info['script_tests'] = matches
    print(f"Total test() calls in {os.path.basename(script_path)}: {len(info['script_tests'])}")

print("\n" + "="*50)
print("COMPREHENSIVE AUTOMATION COVERAGE REPORT")
print("="*50)

total_excel = 0
total_automated = 0

for mod, info in modules.items():
    excel_list = [tc[0] for tc in info['excel_tcs']]
    script_list = info['script_tests']
    
    # Check matching
    matched = []
    unmatched_excel = []
    
    for tc_id, desc in info['excel_tcs']:
        # normalize tc_id e.g. sales_ord_01
        found = False
        for s in script_list:
            if tc_id.lower() in s.lower() or tc_id.replace('_', '-').lower() in s.lower() or tc_id.replace('-', '_').lower() in s.lower():
                found = True
                matched.append((tc_id, s))
                break
        if not found:
            unmatched_excel.append((tc_id, desc))
            
    total_excel += len(excel_list)
    total_automated += len(matched)
    rate = (len(matched) / len(excel_list) * 100) if excel_list else 0
    print(f"\nModule: {mod.upper()}")
    print(f"  - Test cases in Excel: {len(excel_list)}")
    print(f"  - Automated in Script: {len(matched)} / {len(script_list)} test() blocks")
    print(f"  - Automation Rate: {rate:.1f}%")
    if unmatched_excel:
        print(f"  - Chưa tự động hóa ({len(unmatched_excel)} TCs):")
        for u, d in unmatched_excel[:5]:
            print(f"      + {u}: {d[:50]}")
        if len(unmatched_excel) > 5:
            print(f"      ... and {len(unmatched_excel) - 5} more")

overall_rate = (total_automated / total_excel * 100) if total_excel else 0
print("\n" + "="*50)
print(f"OVERALL AUTOMATION RATE: {total_automated}/{total_excel} = {overall_rate:.1f}%")
print("="*50)

