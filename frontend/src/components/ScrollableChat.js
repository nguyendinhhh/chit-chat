import { Avatar, Tooltip } from '@chakra-ui/react';
import React from 'react'
import ScrollableFeed from "react-scrollable-feed";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';

const ScrollableChat = ({ messages }) => {
    const { user } = ChatState();
  return (
      <ScrollableFeed>
          {messages && messages.map((currentMessage, index) => (
              <div style={{display: "flex"}} key={currentMessage._id}>
                  {(isSameSender(messages, currentMessage, index, user._id)
                      || isLastMessage(messages, index, user._id)) &&
                      (
                      <Tooltip label={currentMessage.sender.name} placement="bottom-start" hasArrow>
                          <Avatar mt="7px" mr={1} size="sm" cursor="pointer" name={currentMessage.sender.name} src={currentMessage.sender.pic} />
                      </Tooltip>
                      )
                  }
                  <span style={{
                      backgroundColor: `${currentMessage.sender._id === user._id ? "#E9D8FD" : "#E8E8E8"}`,
                      borderRadius: "20px",
                      padding: "5px 15px",
                      maxWidth: "75%",
                      marginLeft: isSameSenderMargin(messages, currentMessage, index, user._id),
                      marginTop: isSameUser(messages,currentMessage,index) ? 3 : 10,
                  }}>{currentMessage.content}</span>
            </div>
          ))}
    </ScrollableFeed>
  ) 
}

export default ScrollableChat