import React, { useState, useEffect, useRef } from 'react';
import { Typography, IconButton, Stack } from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import Footer from '../components/footer';
import SideBar from '../components/sideBar';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthHeader } from 'react-auth-kit';
import io from 'socket.io-client';
import Icon from '../components/icon';

const socket = io('http://localhost:5000');

const PasteIcon = ContentPasteIcon;

const ChatPage = () => {
    const { id } = useParams<{ id: string }>();
    const authHeader = useAuthHeader();

    const scrollableDiv = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<{ author: 'user' | 'assistant'; content: string }[]>([]);
    const [footerHeight, setFooterHeight] = useState<number>(0);
    const [height, setHeight] = useState<string>('calc(100vh - 64px)');
    const [width, setWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const updateWidth = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', updateWidth);

        return () => window.removeEventListener('resize', updateWidth);
    }, [width]);

    const handleHeightChange = (footeHeight: number) => {
        setFooterHeight(footeHeight);
    };

    useEffect(() => {
        setHeight(`calc(100vh - ${footerHeight}px)`);
    }, [footerHeight]);

    const getMessages = async () => {
        const res = await axios.get(`http://localhost:5000/api/chat/getMessagesByChatID/${id}`, { headers: { Authorization: authHeader() } });
        const data = res.data;
        setMessages(data);
    };

    // at the beginning, get all messages
    useEffect(() => {
        getMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // when page is loaded, scroll to the bottom of the page
    useEffect(() => {
        if (scrollableDiv.current) {
            scrollableDiv.current.scrollTo(0, scrollableDiv.current.scrollHeight);
        }
    }, [messages, width]);

    useEffect(() => {
        socket.on('newMessage', (data: { chatID: string }) => {
            if (data.chatID === id) {
                getMessages();
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    const handleWidthSide = () => {
        if (width < 1000) {
            return '0px';
        } else {
            return '260px';
        }
    };

    const handleWidthMain = () => {
        if (width < 1000) {
            return '100vw';
        } else {
            return 'calc(100vw - 260px)';
        }
    };

    const handleMessageWidth = () => {
        if (width < 1000) {
            return '100%';
        } else {
            return '45%';
        }
    };

    return (
        <div id='ChatPage' style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center' }}>
            <div id='side' style={{ width: handleWidthSide(), height: '100%' }}>
                {width > 1000 && <SideBar />}
            </div>
            <div id='main' style={{ width: handleWidthMain(), height: height, overflowY: 'auto' }} ref={scrollableDiv}>
                <div id='center' style={{ width: '100%' }}>
                    <Stack direction='column-reverse' sx={{ width: '100%', height: '100%' }}>
                        {messages.map((message, index) => {
                            if (message.author === 'assistant' && message.content.includes('\n' || '```' || '`')) {
                                const content: string[] = message.content.split('\n' || '```');
                                let code: boolean = false;
                                return (
                                    <div key={index} style={{ backgroundColor: '#444654', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                        <Icon role={message.author} />
                                        <div style={{ width: handleMessageWidth(), marginBottom: '15px', marginTop: '15px' }}>
                                            {content.map((line, index) => {
                                                if (line.includes('```')) {
                                                    code = !code;
                                                    if (code) {
                                                        return (
                                                            <Typography
                                                                key={index}
                                                                variant='body1'
                                                                sx={{
                                                                    color: '#343541',
                                                                    fontFamily: 'Noto Sans',
                                                                    fontSize: '0.95rem',
                                                                    lineHeight: '2',
                                                                    paddingLeft: '1rem',
                                                                    paddingRight: '1rem',
                                                                    mt: '20px',
                                                                    backgroundColor: '#343541',
                                                                    borderTopLeftRadius: '7px',
                                                                    borderTopRightRadius: '7px',
                                                                    pointerEvents: 'none',
                                                                    userSelect: 'none',
                                                                    WebkitUserSelect: 'none',
                                                                    MozUserSelect: 'none',
                                                                    msUserSelect: 'none'
                                                                }}>
                                                                .
                                                            </Typography>
                                                        );
                                                    } else {
                                                        return (
                                                            <Typography
                                                                key={index}
                                                                variant='body1'
                                                                sx={{
                                                                    color: 'black',
                                                                    fontFamily: 'Noto Sans',
                                                                    fontSize: '0.95rem',
                                                                    lineHeight: '1',
                                                                    paddingLeft: '1rem',
                                                                    paddingRight: '1rem',
                                                                    mb: '20px',
                                                                    backgroundColor: 'black',
                                                                    borderBottomLeftRadius: '7px',
                                                                    borderBottomRightRadius: '7px',
                                                                    pointerEvents: 'none',
                                                                    userSelect: 'none',
                                                                    WebkitUserSelect: 'none',
                                                                    MozUserSelect: 'none',
                                                                    msUserSelect: 'none'
                                                                }}>
                                                                .
                                                            </Typography>
                                                        );
                                                    }
                                                } else {
                                                    if (code) {
                                                        return (
                                                            <Typography
                                                                key={index}
                                                                variant='body1'
                                                                component={'pre'}
                                                                sx={{
                                                                    color: '#D1D5D2',
                                                                    fontFamily: 'FireCode',
                                                                    fontSize: '0.9rem',
                                                                    lineHeight: '1.4',
                                                                    paddingLeft: '2rem',
                                                                    paddingRight: '1rem',
                                                                    bgcolor: 'black',
                                                                    paddingTop: '0.25rem'
                                                                }}>
                                                                {line}
                                                            </Typography>
                                                        );
                                                    } else {
                                                        return (
                                                            <Typography
                                                                key={index}
                                                                variant='body1'
                                                                sx={{
                                                                    color: '#D1D5D2',
                                                                    fontFamily: 'Noto Sans',
                                                                    fontSize: '0.95rem',
                                                                    lineHeight: '1.8',
                                                                    paddingLeft: '1rem',
                                                                    paddingRight: '1rem'
                                                                }}>
                                                                {line}
                                                            </Typography>
                                                        );
                                                    }
                                                }
                                            })}
                                        </div>
                                        <IconButton sx={{ color: '#7F7F90', mt: '26px', width: '25px', height: '25px', borderRadius: '7px', '&:hover': { color: '#D9D9E3' } }}>
                                            <PasteIcon sx={{ fontSize: '15px' }} />
                                        </IconButton>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={index}
                                        style={{ backgroundColor: message.author === 'user' ? '#343541' : '#444654', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                        <Icon role={message.author} />
                                        <div style={{ width: handleMessageWidth() }}>
                                            <Typography
                                                variant='body1'
                                                sx={{
                                                    color: message.author === 'user' ? 'white' : '#D1D5D2',
                                                    fontFamily: 'Noto Sans',
                                                    fontSize: '0.95rem',
                                                    p: '1rem',
                                                    lineHeight: '2',
                                                    mt: '10px',
                                                    mb: '10px'
                                                }}>
                                                {message.content}
                                            </Typography>
                                        </div>
                                        <IconButton sx={{ color: '#7F7F90', mt: '26px', width: '25px', height: '25px', borderRadius: '7px', '&:hover': { color: '#D9D9E3' } }}>
                                            <PasteIcon sx={{ fontSize: '15px' }} />
                                        </IconButton>
                                    </div>
                                );
                            }
                        })}
                    </Stack>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Footer setHeight={handleHeightChange} newInput='' />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
