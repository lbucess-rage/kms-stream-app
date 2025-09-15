#!/bin/bash

# KMS Stream App Production Deployment Script
# 
# Usage: ./deploy.sh [options]
# Options:
#   -p, --port PORT       서버 포트 (기본값: 15700)
#   -h, --host HOST       서버 호스트 (기본값: 0.0.0.0)
#   -b, --build-only      빌드만 수행
#   -s, --serve-only      serve만 수행 (빌드 스킵)
#   --help                도움말 표시

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 기본값
PORT=15700
HOST="0.0.0.0"
BUILD_ONLY=false
SERVE_ONLY=false
DAEMON_MODE=false
LOG_DIR="./logs"

# 함수: 도움말 출력
show_help() {
    echo "KMS Stream App Production Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT       서버 포트 (기본값: 15700)"
    echo "  -h, --host HOST       서버 호스트 (기본값: 0.0.0.0)"
    echo "  -b, --build-only      빌드만 수행"
    echo "  -s, --serve-only      serve만 수행 (빌드 스킵)"
    echo "  -d, --daemon          데몬 모드로 실행 (백그라운드)"
    echo "  --help                도움말 표시"
    echo ""
    echo "Examples:"
    echo "  $0                    # 기본 설정으로 빌드 후 배포"
    echo "  $0 -p 8080            # 포트 8080으로 배포"
    echo "  $0 -b                 # 빌드만 수행"
    echo "  $0 -s -p 3000         # 이미 빌드된 앱을 포트 3000으로 서빙"
    echo "  $0 -d                 # 데몬 모드로 실행 (백그라운드)"
}

# 함수: 로그 출력
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 명령줄 인자 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -s|--serve-only)
            SERVE_ONLY=true
            shift
            ;;
        -d|--daemon)
            DAEMON_MODE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# 시작
log_info "KMS Stream App 프로덕션 배포 시작..."
log_info "설정: HOST=$HOST, PORT=$PORT"

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    log_error "Node.js가 설치되지 않았습니다."
    exit 1
fi

NODE_VERSION=$(node -v)
log_info "Node.js 버전: $NODE_VERSION"

# npm 버전 확인
if ! command -v npm &> /dev/null; then
    log_error "npm이 설치되지 않았습니다."
    exit 1
fi

NPM_VERSION=$(npm -v)
log_info "npm 버전: $NPM_VERSION"

# 빌드 수행
if [ "$SERVE_ONLY" = false ]; then
    log_info "의존성 설치 중..."
    # npm ci 대신 npm install 사용 (더 안정적)
    npm install --loglevel=error
    
    log_info "프로덕션 빌드 시작..."
    
    # 환경 변수 설정 (필요시)
    export REACT_APP_API_URL=${REACT_APP_API_URL:-"http://10.62.130.84:19001/chat/query"}
    export GENERATE_SOURCEMAP=false
    
    # 빌드 실행
    npm run build
    
    if [ -d "build" ]; then
        log_info "빌드 완료! (build 디렉토리 생성됨)"
        
        # 빌드 정보 출력
        BUILD_SIZE=$(du -sh build | cut -f1)
        log_info "빌드 크기: $BUILD_SIZE"
    else
        log_error "빌드 실패! (build 디렉토리가 생성되지 않음)"
        exit 1
    fi
fi

# 빌드만 수행 옵션 체크
if [ "$BUILD_ONLY" = true ]; then
    log_info "빌드 완료! (--build-only 옵션)"
    exit 0
fi

# 프로덕션 서버 실행
log_info "프로덕션 서버 시작 중..."

# serve 패키지 확인 및 설치
if ! command -v serve &> /dev/null; then
    log_warning "serve가 설치되지 않았습니다. 설치 중..."
    npm install -g serve
fi

# build 디렉토리 확인
if [ ! -d "build" ]; then
    log_error "build 디렉토리가 없습니다. 먼저 빌드를 수행하세요."
    exit 1
fi

# 기존 서버 프로세스 종료 (같은 포트 사용 중인 경우)
if lsof -i:$PORT &> /dev/null; then
    log_warning "포트 $PORT가 이미 사용 중입니다. 기존 프로세스를 종료합니다..."
    kill $(lsof -t -i:$PORT) 2>/dev/null || true
    sleep 2
fi

# 서버 시작
log_info "서버를 시작합니다..."
log_info "접속 URL: http://$HOST:$PORT"
log_info "종료하려면 Ctrl+C를 누르세요."

# 로그 디렉토리 생성 (데몬 모드용)
if [ "$DAEMON_MODE" = true ]; then
    mkdir -p "$LOG_DIR"
fi

# serve 실행
if [ "$DAEMON_MODE" = true ]; then
    log_info "데몬 모드로 실행 중..."
    nohup serve -s build -l $PORT -n > "$LOG_DIR/serve.log" 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > .server.pid
    log_info "서버가 백그라운드에서 실행 중입니다. (PID: $SERVER_PID)"
    log_info "로그 확인: tail -f $LOG_DIR/serve.log"
    log_info "서버 중지: kill \$(cat .server.pid)"
else
    serve -s build -l $PORT -n
fi