import re

filepath = r"c:\Users\ahnaf\Downloads\Database\Library-Management-System\library-frontend\src\pages\reader\Home.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# remove import
text = re.sub(r"import ReadingProgressList from '\./components/ReadingProgressList';\n", '', text)

# remove reading progress variable
text = re.sub(r"  const readingProgress = dashboard\?\.reading_progress \|\| \[\];\n", '', text)

# remove averageProgress logic
avg_logic = r"""    const averageProgress = readingProgress\.length === 0
      \? 0
      : readingProgress\.reduce\(\(total, row\) => total \+ Number\(row\.progress_percent \|\| 0\), 0\) / readingProgress\.length;

"""
text = re.sub(avg_logic, '', text)

text = re.sub(r"      averageProgress,\n", '', text)
text = re.sub(r"  \}, \[mergedBooks, purchasedBooks, readingProgress\]\);", r"  }, [mergedBooks, purchasedBooks]);", text)

# remove average progress card
avg_card = r"""        <article className="reader-summary-card">
          <p className="reader-summary-label">Average Progress</p>
          <h3>\{summary\.averageProgress\.toFixed\(0\)\}%</h3>
          <small>Across your active reads</small>
        </article>"""
text = re.sub(avg_card, '', text)

# remove ReadingProgressList section
prog_section = r"""        <article className="card reader-section">
          <div className="card-header reader-section-header"><h3>Reading Progress</h3></div>
          <div className="card-body">
            <ReadingProgressList
              progressRows=\{readingProgress\}
              onContinue=\{continueReading\}
              actionLoading=\{actionLoading\}
            />
          </div>
        </article>

"""
text = re.sub(prog_section, '', text)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("Reading progress removed from reader dashboard.")
