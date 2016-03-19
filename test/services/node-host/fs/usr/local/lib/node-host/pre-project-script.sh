
cd $PROJECT_DIR

if [[ ! -d "./node_modules" ]]; then
  echo "No `node_modules` dir found; installing dev dependencies..."
  npm install
fi
