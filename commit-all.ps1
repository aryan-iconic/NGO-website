$files = git status --porcelain | ForEach-Object { $_.Substring(3) }
foreach ($file in $files) {
    if ($file -ne "") {
        git add $file
        git commit -m "Update $file"
    }
}
git push
