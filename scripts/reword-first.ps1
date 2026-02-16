# Git SEQUENCE_EDITOR: replace first "pick" with "reword" so we edit that commit message
# Git passes the path to the todo file as first argument
$path = $args[0]
if (-not $path) { $path = $args[-1] }
if ($path -and (Test-Path $path)) {
  $content = (Get-Content $path -Raw) -replace 'pick d0ae2ec ', 'reword d0ae2ec '
  [System.IO.File]::WriteAllText($path, $content)
}
