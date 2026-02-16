# Remove Co-authored-by lines from commit message file (used by git during rebase reword)
# Git passes the path to the message file as first argument
$path = $args[0]
if (-not $path) { $path = $args[-1] }
if ($path -and (Test-Path $path)) {
  $content = (Get-Content $path -Raw) -replace '(?m)^.*Co-authored-by:.*\r?\n', ''
  [System.IO.File]::WriteAllText($path, $content.TrimEnd())
}
