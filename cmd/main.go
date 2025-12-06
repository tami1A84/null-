package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	// 【確認済み】静的ファイルの提供
	// プロジェクトルート（null-web/）から見て "./static" ディレクトリを参照
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	
	// メインページ
	http.HandleFunc("/", handleIndex)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on :%s", port)
	log.Printf("Open http://localhost:%s in your browser", port)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	// 【確認済み】HTMLファイルの提供
	// プロジェクトルート（null-web/）から見て "./templates/index.html" ファイルを参照
	http.ServeFile(w, r, "./templates/index.html")
}
