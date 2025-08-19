#!/bin/bash

# Open the saved Kate session and run in the background
kate -s wedding-website &

# Check if tmux is installed
if ! command -v tmux &> /dev/null
then
    echo "tmux is not installed. Please install it to use this script."
    exit 1
fi

# Create a new tmux session named 'wedding'
tmux new-session -d -s wedding

# Start the Flask backend in the first pane
tmux send-keys -t wedding:0.0 "cd server && source venv/bin/activate.fish && flask run" C-m

# Split the window to create a second pane for the frontend
tmux split-window -h -t wedding:0

# Start the React frontend in the second pane
tmux send-keys -t wedding:0.1 "cd client && npm run dev" C-m

# Attach to the tmux session
tmux attach-session -t wedding
