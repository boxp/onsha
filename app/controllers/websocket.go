package controllers

import (
	"github.com/boxp/onsha/app/field"
	"github.com/revel/revel"
	"golang.org/x/net/websocket"
	"io"
)

type AppWebsocket struct {
	*revel.Controller
}

func (c AppWebsocket) Socket(ws *websocket.Conn) revel.Result {
	user := field.Join()
	defer field.Leave(user)

	newDatas := make(chan string, 10)

	go func() {
		var data string
		for {
			err := websocket.Message.Receive(ws, &data)
			if err != nil {
				close(newDatas)
				return
			}

			newDatas <- data
		}
	}()

	for {
		select {
		case e := <-user.Session:
			io.WriteString(ws, e.Data)
		case data, ok := <-newDatas:
			if !ok {
				return nil
			}
			field.Shout(user, data)

		}
	}

	return nil
}
