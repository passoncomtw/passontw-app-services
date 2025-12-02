.PHONY: run-token-app-service run-merchant-app help

# 預設目標：顯示幫助
help:
	@echo "可用的命令："
	@echo "  make run-token-app-service  - 啟動 E幣錢包應用 (Expo)"
	@echo "  make run-merchant-app       - 啟動 POS 商戶應用 (Electron)"

# 啟動 Token App Service (E幣錢包)
run-token-app-service:
	@echo "🚀 啟動 Token App Service..."
	cd cmd/token-app-service && yarn start -c

# 啟動 POS Merchant App (商戶應用)
run-merchant-app:
	@echo "🚀 啟動 POS Merchant App..."
	cd cmd/pos-merchant-app && yarn dev

