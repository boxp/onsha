package field

import (
	"container/list"
)

type Event struct {
	Type string // "shout"
	User User
	Data string
}

type User struct {
	Id      int
	Session chan Event
}

var (
	publish     = make(chan Event, 10)
	subscribe   = make(chan (chan Event), 10)
	unsubscribe = make(chan User, 10)
	newIds      = make(chan int, 10)
)

func Join() User {
	session := make(chan Event, 10)
	subscribe <- session
	return User{<-newIds, session}
}

func Leave(user User) {
	unsubscribe <- user
}

func Shout(user User, data string) {
	event := Event{"shout", user, data}
	publish <- event
}

func Field() {
	sessions := list.New()
	userId := 0

	/* main loop */
	for {
		select {
		case ch := <-subscribe:
			sessions.PushBack(ch)
			newIds <- userId
			userId++
		case user := <-unsubscribe:
			for ch := sessions.Front(); ch != nil; ch = ch.Next() {
				if ch.Value.(chan Event) == user.Session {
					sessions.Remove(ch)
					break
				}
			}
			close(user.Session)
		case e := <-publish:
			for ch := sessions.Front(); ch != nil; ch = ch.Next() {
				ch.Value.(chan Event) <- e
			}
		}
	}

}

func init() {
	go Field()
}
