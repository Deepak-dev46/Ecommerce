#!/bin/bash

echo "🛑 Stopping all services..."

# Kill all Java (Spring Boot) processes
taskkill //F //IM java.exe > /dev/null 2>&1

echo "✅ All services stopped"