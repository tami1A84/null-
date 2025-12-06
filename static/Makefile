.PHONY: run build clean install deps

# デフォルトターゲット
all: build

# 依存関係のインストール
deps:
	go mod download

# アプリケーションの実行
run:
	go run cmd/main.go

# ビルド
build:
	go build -o null-web cmd/main.go

# クリーン
clean:
	rm -f null-web
	go clean

# インストール
install: build
	sudo mv null-web /usr/local/bin/

# 開発モード（ホットリロード）
dev:
	@echo "Starting development server..."
	@which air > /dev/null || (echo "Installing air..." && go install github.com/cosmtrek/air@latest)
	air

# テスト
test:
	go test -v ./...

# フォーマット
fmt:
	go fmt ./...

# Lint
lint:
	@which golangci-lint > /dev/null || (echo "Installing golangci-lint..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run
