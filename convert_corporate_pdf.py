import win32com.client, os

pptx = r"c:\Users\sautr\food_app\FoodRedist_Corporate.pptx"
pdf  = r"c:\Users\sautr\food_app\FoodRedist_Corporate.pdf"

app = win32com.client.Dispatch("PowerPoint.Application")
app.Visible = True
try:
    deck = app.Presentations.Open(pptx, ReadOnly=True, Untitled=False, WithWindow=False)
    deck.SaveAs(pdf, 32)
    deck.Close()
    print(f"PDF saved: {pdf}")
    print(f"Size: {round(os.path.getsize(pdf)/1024, 1)} KB")
finally:
    app.Quit()
