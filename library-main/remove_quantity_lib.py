import re

filepath = r"c:\Users\ahnaf\Downloads\Database\Library-Management-System\library-main\app\Http\Controllers\Api\LibraryDataController.php"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# reviewPublisherBook
text = re.sub(r"\$submissionQuantity = max\(1, \(int\) \(\$submission->quantity \?\? 1\)\);\s*", '', text)
text = re.sub(r"'quantity' => \$submissionQuantity,\s*", '', text)
text = re.sub(r"'available' => \$submissionQuantity,\s*", '', text)

# select lists
text = re.sub(r"'b\.quantity',\s*", '', text)
text = re.sub(r"'b\.available',\s*", '', text)
text = re.sub(r"'b\.available_quantity',\s*", '', text)

# validations
text = re.sub(r"'quantity' => 'nullable\|integer\|min:1\|max:9999',\s*", '', text)

# storeBook logic
text = re.sub(r"\$quantity = max\(1, \(int\) \(\$validated\['quantity'\] \?\? 1\)\);\s*", '', text)
text = re.sub(r"'quantity' => \$quantity,\s*", '', text)
text = re.sub(r"'available' => \$quantity,\s*", '', text)

# updateBook logic
text = re.sub(r"\$newQuantity = max\(1, \(int\) \(\$validated\['quantity'\] \?\? \$book->quantity \?\? 1\)\);\s*", '', text)
updateLogic = r"""\$issuedCount = max\(0, \(int\) \$book->quantity - \(int\) \$book->available\);

        if \(\$newQuantity < \$issuedCount\) {
            return response\(\)->json\(\[
                'message' => 'Quantity cannot be lower than currently issued copies \(' \. \$issuedCount \. '\)\.',
            \], 422\);
        }

        \$newAvailable = \$newQuantity - \$issuedCount;"""
text = re.sub(updateLogic, '', text, flags=re.DOTALL)
text = re.sub(r"'quantity' => \$newQuantity,\s*", '', text)
text = re.sub(r"'available' => \$newAvailable,\s*", '', text)

# stats
text = re.sub(r"\$totalBooks = \(int\) DB::table\('books'\)->sum\('quantity'\);", r"\$totalBooks = (int) DB::table('books')->count();", text)

# seeds
text = re.sub(r", 'quantity' => \d+", '', text)
text = re.sub(r"'quantity' => \$book\['quantity'\],\s*", '', text)
text = re.sub(r"'available' => \$book\['quantity'\],\s*", '', text)
text = re.sub(r"'quantity', 'available_quantity', ", '', text)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("LibraryDataController.php sanitized.")
