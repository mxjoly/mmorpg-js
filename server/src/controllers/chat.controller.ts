import { Request, Response } from "express";
import { database } from "../database";
import { ChatMessageSchema } from "../../../shared/database.schemas";

export function getChatMessages(req: Request, res: Response) {
  database.exists("/chat").then((exists) => {
    if (exists) {
      database
        .getData("/chat")
        .then((chats) => {
          res.status(200).json(chats);
        })
        .catch((error) => {
          res.status(404).send(error);
        });
    } else {
      res.status(200).json([]);
    }
  });
}

export function postChatMessage(req: Request, res: Response) {
  const chatMessage: ChatMessageSchema = req.body;
  database
    .push("/chat[]", chatMessage)
    .then(() => {
      res.status(201).send();
    })
    .catch((error) => {
      res.status(404).send(error);
    });
}

export function deleteChatMessages(req: Request, res: Response) {
  database
    .delete("/chat")
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(404).send(error);
    });
}
