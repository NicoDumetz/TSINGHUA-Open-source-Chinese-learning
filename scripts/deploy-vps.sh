#!/usr/bin/env bash
set -euo pipefail

# Only this dedicated site directory can be modified by this script.
readonly destination='/var/www/TSINGHUA-Open-source-Chinese-learning'
: "${VPS_HOST:?Set the VPS_HOST GitHub secret}"
: "${VPS_USER:?Set the VPS_USER GitHub secret}"
: "${VPS_SSH_KEY:?Set the VPS_SSH_KEY GitHub secret}"
port="${VPS_PORT:-22}"
[[ "$VPS_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]] || { echo 'VPS_HOST must be a hostname or IPv4 address, without a URL or port.' >&2; exit 1; }
[[ "$VPS_USER" =~ ^[a-zA-Z_][a-zA-Z0-9_-]*$ ]] || { echo 'Invalid VPS_USER.' >&2; exit 1; }
[[ "$port" =~ ^[0-9]{1,5}$ ]] && (( 10#$port > 0 && 10#$port <= 65535 )) || { echo 'Invalid VPS_PORT.' >&2; exit 1; }
[[ -s dist/index.html && -d dist/assets && -d dist/audio && -d dist/strokes ]] || { echo 'Incomplete dist/: build and test the site first.' >&2; exit 1; }

ssh_dir=$(mktemp -d)
trap 'rm -rf -- "$ssh_dir"' EXIT
chmod 700 "$ssh_dir"
printf '%s\n' "$VPS_SSH_KEY" | tr -d '\r' > "$ssh_dir/key"
chmod 600 "$ssh_dir/key"
ssh-keygen -y -P '' -f "$ssh_dir/key" > /dev/null || { echo 'VPS_SSH_KEY must contain a complete, unencrypted private key.' >&2; exit 1; }
if [[ -n "${VPS_KNOWN_HOSTS:-}" ]]; then
  printf '%s\n' "$VPS_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
else
  # Preserve compatibility with the existing three-secret setup.
  echo '::warning::Add VPS_KNOWN_HOSTS to pin the verified VPS host key. Using ssh-keyscan for this deployment.'
  ssh-keyscan -T 10 -p "$port" -H "$VPS_HOST" > "$ssh_dir/known_hosts"
fi
[[ -s "$ssh_dir/known_hosts" ]] || { echo 'No SSH host key received.' >&2; exit 1; }
ssh_opts=(-i "$ssh_dir/key" -p "$port" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$ssh_dir/known_hosts" -o ConnectTimeout=15)
remote="$VPS_USER@$VPS_HOST"
ssh "${ssh_opts[@]}" "$remote" "set -eu; command -v rsync >/dev/null; test -d '$destination' || mkdir -p '$destination'; test -w '$destination' || { echo 'Deployment directory is not writable by the SSH user.' >&2; exit 1; }"
printf -v rsync_ssh '%q ' ssh "${ssh_opts[@]}"
# Transfer dependencies before the entry point; retain old hashed assets so
# open tabs continue working and a failed transfer leaves the old index usable.
rsync -az --delay-updates --chmod=D755,F644 --exclude='/index.html' \
  -e "$rsync_ssh" dist/ "$remote:$destination/"
rsync -az --delay-updates --chmod=F644 -e "$rsync_ssh" \
  dist/index.html "$remote:$destination/index.html"
local_hash=$(sha256sum dist/index.html | cut -d ' ' -f 1)
remote_hash=$(ssh "${ssh_opts[@]}" "$remote" "sha256sum '$destination/index.html'" | cut -d ' ' -f 1)
[[ "$local_hash" == "$remote_hash" ]] || { echo 'Remote index checksum mismatch.' >&2; exit 1; }
echo 'Tested build transferred and remote index verified.'
