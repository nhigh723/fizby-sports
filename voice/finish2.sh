#!/bin/bash
# Second voice pass (low priority): lines still without a clip (new lines + first-pass gaps) get a 3rd take, then gate + install again, build.
cd "$(dirname "$0")/.."; while [ ! -f voice/done ]; do sleep 30; done
node scripts/voice-lines.mjs > voice/pass2.log 2>&1 && python3 scripts/pad-voice.py prep voice/todo.json >> voice/pass2.log 2>&1
nice -n 19 /workspace/tts/qvenv/bin/python scripts/gen_takes.py voice/pad.json voice/padtakes 3 > voice/gen2.log 2>&1
nice -n 19 /workspace/tts/pvenv/bin/python /workspace/tts/qclone/gate.py voice/pad.json voice/padtakes > voice/gate-pad2.log 2>&1
nice -n 19 /workspace/tts/pvenv/bin/python scripts/pad-voice.py install voice/todo.json > voice/pad-install2.log 2>&1
node scripts/voice-lines.mjs >> voice/pass2.log 2>&1; npm run build > voice/build.log 2>&1; touch voice/done2
