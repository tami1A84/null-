package main

import (
	"embed"
	"log"
	"net/http"
	"os"
)

//go:embed static templates
var content embed.FS

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 静的ファイルハンドラ
	http.Handle("/static/", http.FileServer(http.FS(content)))

	// ルートハンドラ
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		
		indexHTML, err := content.ReadFile("templates/index.html")
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(indexHTML)
	})

	log.Printf("Server starting on port %s...", port)
	log.Printf("Open http://localhost:%s in your browser", port)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
