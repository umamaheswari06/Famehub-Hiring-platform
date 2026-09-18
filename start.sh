#!/bin/bash
# =============================================================
# Famehub AI-Powered Hiring Platform - One-Command Startup
# Usage: ./start.sh
#        ./start.sh docker   (full Docker Compose stack)
#        ./start.sh dev      (default: native dev servers)
# =============================================================

MODE="${1:-dev}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "\033[36m  ¦¦¦¦¦¦¦+ ¦¦¦¦¦+ ¦¦¦+   ¦¦¦+¦¦¦¦¦¦¦+¦¦+  ¦¦+¦¦+   ¦¦+¦¦¦¦¦¦+ \033[0m"
echo -e "\033[36m  ¦¦+----+¦¦+--¦¦+¦¦¦¦+ ¦¦¦¦¦¦¦+----+¦¦¦  ¦¦¦¦¦¦   ¦¦¦¦¦+--¦¦+\033[0m"
echo -e "\033[36m  ¦¦¦¦¦+  ¦¦¦¦¦¦¦¦¦¦+¦¦¦¦+¦¦¦¦¦¦¦¦+  ¦¦¦¦¦¦¦¦¦¦¦   ¦¦¦¦¦¦¦¦¦++\033[0m"
echo -e "\033[36m        AI-Powered Hiring & Assessment Platform              \033[0m"
echo -e "\033[35m              Fully Automated Hiring Pipelines               \033[0m"
echo ""

if [ "$MODE" = "docker" ]; then
    echo -e "\033[33m[Docker] Starting full stack via Docker Compose...\033[0m"
    docker compose -f "$ROOT_DIR/docker/docker-compose.yml" up --build -d
    echo ""
    echo -e "\033[32m[Docker] All services started!\033[0m"
    echo -e "  -> Frontend : \033[36mhttp://localhost\033[0m"
    echo -e "  -> Backend  : \033[36mhttp://localhost:8080\033[0m"
    echo -e "  -> Judge0   : \033[36mhttp://localhost:2358\033[0m"
    echo -e "  -> Swagger  : \033[36mhttp://localhost:8080/swagger-ui.html\033[0m"
    echo ""
    echo -e "\033[90mTo stop: docker compose -f docker/docker-compose.yml down\033[0m"
else
    echo -e "\033[33m[Dev] Starting backend (Spring Boot) + frontend (Vite) in parallel...\033[0m"
    echo ""

    # Start backend in background
    (cd "$ROOT_DIR/backend" && echo -e "\033[32m[Backend] Spring Boot starting...\033[0m" && mvn spring-boot:run) &
    BACKEND_PID=$!

    sleep 3

    # Start frontend in background
    (cd "$ROOT_DIR/frontend" && echo -e "\033[36m[Frontend] Vite dev server starting...\033[0m" && npm run dev) &
    FRONTEND_PID=$!

    echo ""
    echo -e "\033[32m[Dev] Both servers running!\033[0m"
    echo -e "  -> Frontend : \033[36mhttp://localhost:5173\033[0m"
    echo -e "  -> Backend  : \033[36mhttp://localhost:8080\033[0m"
    echo -e "  -> Swagger  : \033[36mhttp://localhost:8080/swagger-ui.html\033[0m"
    echo ""
    echo -e "\033[90mPress Ctrl+C to stop all servers\033[0m"
    echo ""

    # Trap Ctrl+C to kill both processes
    trap "echo ''; echo 'Stopping all servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

    wait $BACKEND_PID $FRONTEND_PID
fi
