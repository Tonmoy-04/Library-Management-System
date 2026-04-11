import re

books_path = r"c:\Users\ahnaf\Downloads\Database\Library-Management-System\library-frontend\src\pages\Books.jsx"

with open(books_path, 'r', encoding='utf-8') as f:
    text = f.read()

# remove from bookForm state
text = re.sub(r"\s*quantity:\s*1,\n", '\n', text)
text = re.sub(r"\s*quantity:\s*book\.quantity(\s*\|\|\s*1)?,\n", '\n', text)
text = re.sub(r"\s*available:\s*book\.available,\n", '\n', text)

# remove from payload
text = re.sub(r"\s*payload\.append\('quantity',\s*String\(Number\(bookForm\.quantity\)\s*\|\|\s*1\)\);\n", '\n', text)

# remove from validation/issue logic
issue_logic = r"""    if \(!book \|\| Number\(book\.available\) <= 0\) \{
      setIssueError\('This book is currently unavailable\.'\);
      return;
    \}"""
text = re.sub(issue_logic, '', text)

# remove isDisabled in Table actions
text = re.sub(r"\s*isDisabled:\s*\(_row,\s*rowIndex\)\s*=>\s*Number\(filteredBooks\[rowIndex\]\?\.available\s*\?\?\s*0\)\s*<=\s*0,\n\s*disabledTitle:\s*'Book unavailable for issue',", '', text)

# remove columns
text = text.replace("'Price', 'Quantity', 'Available'", "'Price'")

# remove form input
form_input = r"""                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    className="form-control"
                    value={bookForm\.quantity}
                    onChange=\{\(e\) => setBookForm\(\(prev\) => \(\{ \.\.\.prev, quantity: e\.target\.value \}\)\)\}
                    disabled=\{saving\}
                  />
                </div>"""
text = re.sub(form_input, '', text)

with open(books_path, 'w', encoding='utf-8') as f:
    f.write(text)

dash_path = r"c:\Users\ahnaf\Downloads\Database\Library-Management-System\library-frontend\src\pages\publishers\components\Dashboard.jsx"
with open(dash_path, 'r', encoding='utf-8') as f:
    dash = f.read()

dash = re.sub(r'\s*<span className="copies">\{book\.quantity\}\s*copies</span>', '', dash)
dash = re.sub(r'\s*<span className="available">\{book\.available_quantity\}\s*available</span>', '', dash)

with open(dash_path, 'w', encoding='utf-8') as f:
    f.write(dash)

print("Frontend sanitized.")
