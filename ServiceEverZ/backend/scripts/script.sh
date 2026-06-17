#!/bin/bash

set -e

# ✅ Resolve paths (works everywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
SERVICES_DIR="$BASE_DIR/services"
LOG_DIR="$SCRIPT_DIR"

echo "BASE_DIR: $BASE_DIR"
echo "SERVICES_DIR: $SERVICES_DIR"

echo "🚀 Auto-detecting services..."
echo "-----------------------------------"

start_service () {
  SERVICE_PATH=$1
  SERVICE_NAME=$(basename "$SERVICE_PATH")

  # ✅ Check if it's a Spring Boot project
  if [ ! -f "$SERVICE_PATH/pom.xml" ]; then
    echo "⏭️ Skipping $SERVICE_NAME (no pom.xml)"
    return
  fi

  echo "Starting $SERVICE_NAME..."

  cd "$SERVICE_PATH" || exit

  nohup mvn spring-boot:run > "$LOG_DIR/$SERVICE_NAME.log" 2>&1 &

  echo "✅ $SERVICE_NAME started"
  echo "-----------------------------------"
}

# ✅ Start Eureka FIRST (if exists)
if [ -d "$SERVICES_DIR/eureka-service" ]; then
  start_service "$SERVICES_DIR/eureka-service"
  echo "⏳ Waiting for Eureka to boot..."
  sleep 8
fi

# ✅ Start ALL services EXCEPT gateway & eureka
for dir in "$SERVICES_DIR"/*; do
  SERVICE_NAME=$(basename "$dir")

  if [[ "$SERVICE_NAME" == "eureka-service" || "$SERVICE_NAME" == "api-gateway" ]]; then
    continue
  fi

  start_service "$dir"
done

# ✅ Start API Gateway LAST
if [ -d "$SERVICES_DIR/api-gateway" ]; then
  echo "⏳ Waiting before starting API Gateway..."
  sleep 5
  start_service "$SERVICES_DIR/api-gateway"
fi

echo "🎉 All services started automatically!"