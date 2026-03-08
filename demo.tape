# VHS Demo for ai-commit
# Run: CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" vhs demo.tape

Output docs/images/demo.gif

Set FontSize 18
Set Width 1200
Set Height 600
Set Theme "Catppuccin Mocha"
Set TypingSpeed 60ms
Set Padding 30
Set Shell zsh
Set Framerate 30
Set WindowBar Colorful
Set WindowBarSize 40
Set BorderRadius 12
Set Margin 60
Set MarginFill "/tmp/gradient-bg.png"

# Setup (hidden)
Hide
Type "source ~/.zshrc"
Enter
Sleep 2s
Type "bash /tmp/demo-setup.sh"
Enter
Sleep 1s
Type "cd /tmp/demo-project && export AI_COMMIT_LANGUAGE=en"
Enter
Sleep 500ms
Type "clear"
Enter
Sleep 500ms
Show

# Stage changes
Type "git add ."
Enter
Sleep 1s

# Run ai-commit with auto-confirm
Type "ai-commit -y"
Enter

# Wait for LLM response and commit
Sleep 20s

Sleep 3s
