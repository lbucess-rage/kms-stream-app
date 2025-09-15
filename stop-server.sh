#!/bin/bash

# 서버 중지 스크립트

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# PID 파일 확인
if [ -f ".server.pid" ]; then
    PID=$(cat .server.pid)
    
    # 프로세스 확인
    if ps -p $PID > /dev/null 2>&1; then
        log_info "서버 중지 중... (PID: $PID)"
        kill $PID
        
        # 프로세스 종료 대기
        sleep 2
        
        if ps -p $PID > /dev/null 2>&1; then
            log_warning "서버가 정상적으로 종료되지 않았습니다. 강제 종료합니다."
            kill -9 $PID
        fi
        
        rm -f .server.pid
        log_info "서버가 중지되었습니다."
    else
        log_warning "PID $PID에 해당하는 프로세스가 없습니다."
        rm -f .server.pid
    fi
else
    log_error "실행 중인 서버가 없습니다. (.server.pid 파일이 없음)"
    
    # 포트 15700 사용 중인 프로세스 확인
    if lsof -i:15700 > /dev/null 2>&1; then
        log_warning "포트 15700을 사용 중인 프로세스가 있습니다."
        log_info "해당 프로세스를 종료하려면 다음 명령을 실행하세요:"
        echo "  kill \$(lsof -t -i:15700)"
    fi
fi