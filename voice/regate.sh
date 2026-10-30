#!/bin/bash
# Third voice pass (low priority): every line still without a clip gets up to 4 takes, then gate + install.
nice -n 19 /workspace/tts/pvenv/bin/python /workspace/tts/qclone/gate.py voice/pad.json voice/padtakes > voice/gate-pad3.log 2>&1
nice -n 19 /workspace/tts/pvenv/bin/python scripts/pad-voice.py install voice/todo.json > voice/pad-install3b.log 2>&1
