#!/bin/bash
# Low-priority voice job: carrier-phrase takes -> gate -> trim + clip checks -> install. Reference voice paths come from the environment.
cd "$(dirname "$0")/.."; mkdir -p voice/padtakes
nice -n 19 /workspace/tts/qvenv/bin/python scripts/gen_takes.py voice/pad.json voice/padtakes ${TAKES:-2} > voice/gen.log 2>&1
nice -n 19 /workspace/tts/pvenv/bin/python /workspace/tts/qclone/gate.py voice/pad.json voice/padtakes > voice/gate-pad.log 2>&1
nice -n 19 /workspace/tts/pvenv/bin/python scripts/pad-voice.py install voice/todo.json > voice/pad-install.log 2>&1
touch voice/done
