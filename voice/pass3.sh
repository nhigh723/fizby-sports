#!/bin/bash
# Third voice pass (low priority): every line still without a clip gets up to 4 takes, then gate + install.
cd "$(dirname "$0")/.."; rm -f voice/done3
node scripts/voice-lines.mjs > voice/pass3.log 2>&1 && python3 scripts/pad-voice.py prep voice/todo.json >> voice/pass3.log 2>&1
nice -n 19 /workspace/tts/qvenv/bin/python scripts/gen_takes.py voice/pad.json voice/padtakes ${TAKES:-4} > voice/gen3.log 2>&1
nice -n 19 /workspace/tts/pvenv/bin/python /workspace/tts/qclone/gate.py voice/pad.json voice/padtakes > voice/gate-pad3.log 2>&1
nice -n 19 /workspace/tts/pvenv/bin/python scripts/pad-voice.py install voice/todo.json > voice/pad-install3b.log 2>&1
node scripts/voice-lines.mjs >> voice/pass3.log 2>&1; touch voice/done3
