import win32com.client
import os, sys

pptx_path = r"c:\Users\sautr\food_app\FoodRedist_Presentation.pptx"
pdf_path  = r"c:\Users\sautr\food_app\FoodRedist_Presentation.pdf"

print("Opening PowerPoint...")
ppt_app = win32com.client.Dispatch("PowerPoint.Application")
ppt_app.Visible = True

try:
    deck = ppt_app.Presentations.Open(pptx_path, ReadOnly=True, Untitled=False, WithWindow=False)
    print("Exporting to PDF...")
    deck.SaveAs(pdf_path, 32)   # 32 = ppSaveAsPDF
    deck.Close()
    print(f"Saved: {pdf_path}")
    size_kb = round(os.path.getsize(pdf_path) / 1024, 1)
    print(f"Size: {size_kb} KB")
finally:
    ppt_app.Quit()
