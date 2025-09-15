package main

import (
	"net/http"
	"fmt"
	"github.com/99designs/gqlgen" 
)

func main(){

	http.HandleFunc("/health",func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("The server is healthy"))
	})

	err := http.ListenAndServe(":8000",nil)
	if err != nil {
		fmt.Println("Failed to start server:", err)
	}

}