import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import { Badge, Tooltip, Typography, Button, TextField, Box } from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(3),
    maxWidth: "100vw",
    maxHeight: "120vh",
    overflow: "hidden",
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #f3f4f6, #ffffff)",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: "#ffffff",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  kanbanContainer: {
    flex: 1,
    width: "100%",
    background: "linear-gradient(135deg, #e7f0fd, #fdfdfd)",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
    padding: theme.spacing(3),
  },
  button: {
    background: "linear-gradient(135deg, #6a5acd, #836fff)",
    color: "#fff",
    fontWeight: "bold",
    borderRadius: "30px",
    textTransform: "none",
    padding: theme.spacing(1, 4),
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #836fff, #6a5acd)",
      transform: "scale(1.05)",
      boxShadow: "0px 6px 20px rgba(106, 90, 205, 0.3)",
    },
  },
  smallButton: {
    padding: theme.spacing(0.5, 2), // Menor padding
    fontSize: "0.75rem", // Reduz tamanho da fonte
    height: "30px", // Altura reduzida
  },

  dateInput: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#ffffff",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    "& .MuiOutlinedInput-root": {
      borderRadius: theme.shape.borderRadius,
    },
  },
  scrollContainer: {
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden", // Garante que não haverá barra de rolagem vertical
    display: "flex",
    background: "linear-gradient(135deg, #e7f0fd, #fdfdfd)",
  },
  scrollContent: {
    display: "flex", // Apenas "flex" ao invés de "inline-flex"
    minWidth: "100%", // Ajustado para ocupar 100% sem barra horizontal desnecessária
    flexDirection: "row",
  },
  
  
}));


const Kanban = () => {
  const classes = useStyles();
  const theme = useTheme(); // Obter o tema atual
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketNot, setTicketNot] = useState(0);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const jsonString = user.queues.map(queue => queue.UserQueue.queueId);

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          dateStart: startDate,
          dateEnd: endDate,
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />
      default:
        return "error";
    }
  };

  const popularCards = (jsonString) => {

    console.log(tickets);

    const filteredTickets = tickets.filter(ticket => 
      ticket.status !== 'closed' && 
      (!ticket.user || ticket.user.id === user.id) &&
      ticket.tags.length === 0 // Verifica se o ticket não possui tags
    );

    console.log(filteredTickets);

    
    
    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
              <div  style={{
                display: "flex",
                justifyContent: "space-between", // Distribui espaço entre os elementos
                alignItems: "center", // Alinha os itens verticalmente no centro
              }}>
                {/* <span>{ticket.contact.number}</span> */}
                <Button
                className={`${classes.button} ${classes.smallButton}`} // Adiciona uma classe específica
                onClick={() => {
                  handleCardClick(ticket.uuid);
                }}
              >
                Ver Ticket
              </Button>
              <Typography
                  style={{
                    fontSize: "0.75rem", // Tamanho reduzido
                    color: "#555", // Cor ajustada
                    textAlign: "right", // Alinha a data/hora à direita
                  }}
                >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
              {/* <div style={{ textAlign: 'left' }}>{ticket.lastMessage || " "}</div> */}
              {/* <Button
                className={`${classes.button} ${classes.cardButton}`}
                onClick={() => {
                  handleCardClick(ticket.uuid)
                }}>
                Ver Ticket
              </Button> */}
              <span style={{ marginRight: '8px' }} />
              {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
            </div>
          ),
          title: <>
            <Tooltip title={ticket.whatsapp?.name}>
              {IconChannel(ticket.channel)}
            </Tooltip> {ticket.contact.name}</>,
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
        style: { maxHeight: "calc(93vh - 170px)"},
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => 
          ticket.status !== 'closed' && 
          (!ticket.user || ticket.user.id === user.id) && 
          ticket.tags.some(t => t.id === tag.id) // Filtra apenas tickets que possuem a tag atual
        );
        
        

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div  style={{
                display: "flex",
                justifyContent: "space-between", // Distribui espaço entre os elementos
                alignItems: "center", // Alinha os itens verticalmente no centro
              }}>
                {/* <p>
                  {ticket.contact.number}
                  <br />
                  {ticket.lastMessage || " "}
                </p> */}
                <Button
                className={`${classes.button} ${classes.smallButton}`} // Adiciona uma classe específica
                onClick={() => {
                  handleCardClick(ticket.uuid);
                }}
              >
                Ver Ticket
              </Button>
              <Typography
                    style={{
                      fontSize: "0.75rem", // Tamanho reduzido
                      color: "#555", // Cor ajustada
                      textAlign: "right", // Alinha a data/hora à direita
                    }}
                  >
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                  ) : (
                    <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                  )}
                </Typography>
                <span style={{ marginRight: '8px' }} />
                  {ticket?.user && (<Badge style={{ backgroundColor: "#000000" }} className={classes.connectionTag}>{ticket.user?.name.toUpperCase()}</Badge>)}
              </div>
            ),
            title: <>
              <Tooltip title={ticket.whatsapp?.name}>
                {IconChannel(ticket.channel)}
              </Tooltip> {ticket.contact.name}
            </>,
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { backgroundColor: tag.color, color: "white", maxHeight: "calc(95vh - 170px)"},
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  return (
    <div className={classes.root}>
  <div className={classes.header}>
    <div className={classes.inputContainer}>
      <TextField
        label="Data inicial"
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
        InputLabelProps={{
          shrink: true,
          style: { color: 'black' }, // Define a cor do rótulo como preta
        }}
        InputProps={{
          style: { color: 'black' }, // Define a cor do texto como preta
        }}
        variant="outlined"
        className={classes.dateInput}
      />
      <TextField
        label="Data final"
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        InputLabelProps={{
          shrink: true,
          style: { color: 'black' }, // Define a cor do rótulo como preta
        }}
        InputProps={{
          style: { color: 'black' }, // Define a cor do texto como preta
        }}        variant="outlined"
        className={classes.dateInput}
      />
      <Button
        variant="contained"
        className={classes.button}
        onClick={handleSearchClick}
      >
        Buscar
      </Button>
    </div>
    <Can
      role={user.profile}
      perform="dashboard:view"
      yes={() => (
        <Button
          variant="contained"
          className={classes.button}
          onClick={handleAddConnectionClick}
        >
          + Adicionar Fases
        </Button>
      )}
    />
  </div>
  <div className={classes.scrollContainer}>
    <div className={classes.scrollContent}>
      <Board
      data={file}
      onCardMoveAcrossLanes={handleCardMove}
      style={{
        backgroundColor: "transparent",
        height: "calc(100vh - 200px)",
      }}
      cardStyle={{
        borderRadius: "20px", // Arredonda os cartões
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", 
        padding: "16px",
        backgroundColor: "#ffffff",
      }}
      laneStyle={{
        borderRadius: "12px", // Isso será aplicado, mas depende do CSS do `react-trello`
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", 
        backgroundColor: "#f5f5f5",
        margin: "8px",
        padding: "8px",
      }}
    />
    </div>
  </div>
</div>



  );

};

export default Kanban;
