#!/bin/bash

# 빠른 배포 스크립트 (이미 설치된 의존성 활용)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PORT=15700
LOG_DIR="./logs"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# node_modules 확인
if [ ! -d "node_modules" ]; then
    log_warning "node_modules가 없습니다. 의존성을 설치합니다..."
    log_info "의존성 설치 중... (시간이 걸릴 수 있습니다)"
    npm install --prefer-offline --no-audit --loglevel=error
else
    log_info "기존 node_modules 사용"
fi

# 빌드
log_info "프로덕션 빌드 시작..."
export GENERATE_SOURCEMAP=false
npm run build

if [ ! -d "build" ]; then
    log_error "빌드 실패!"
    exit 1
fi

log_info "빌드 완료!"

# serve 설치 확인 (npm으로 설치된 serve 사용)
SERVE_CMD="/root/.nvm/versions/node/v22.12.0/bin/serve"
if [ ! -f "$SERVE_CMD" ]; then
    log_info "serve 설치 중..."
    npm install -g serve --loglevel=error
    SERVE_CMD="/root/.nvm/versions/node/v22.12.0/bin/serve"
fi

# 데몬 모드 실행
if [ "$1" = "-d" ]; then
    mkdir -p "$LOG_DIR"
    
    # 기존 서버 중지
    if [ -f ".server.pid" ]; then
        OLD_PID=$(cat .server.pid)
        if ps -p $OLD_PID > /dev/null 2>&1; then
            log_warning "기존 서버 중지 중..."
            kill $OLD_PID 2>/dev/null || true
            sleep 2
        fi
    fi
    
    log_info "데몬 모드로 서버 시작..."
    nohup $SERVE_CMD -s build -l $PORT -n > "$LOG_DIR/serve.log" 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > .server.pid
    
    sleep 3
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        log_info "✅ 서버가 백그라운드에서 실행 중입니다. (PID: $SERVER_PID)"
        log_info "📍 접속 URL: http://0.0.0.0:$PORT"
        log_info "📋 로그 확인: tail -f $LOG_DIR/serve.log"
        log_info "🛑 서버 중지: ./stop-server.sh"
    else
        log_error "서버 시작 실패!"
        exit 1
    fi
else
    log_info "서버 시작..."
    log_info "접속 URL: http://0.0.0.0:$PORT"
    $SERVE_CMD -s build -l $PORT -n
fi