import React, { useState, useEffect, useCallback } from "react";
import { makeStyles, Paper, Typography, Modal } from "@material-ui/core";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import useHelps from "../../hooks/useHelps";

const useStyles = makeStyles(theme => ({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  mainPaperContainer: {
    overflowY: 'auto',
    flex: 1,
    padding: theme.spacing(2),
  },
  mainPaper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: theme.spacing(3),
  },
  helpPaper: {
    position: 'relative',
    width: '100%',
    padding: theme.spacing(2),
    boxShadow: theme.shadows[3],
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: theme.palette.background.paper,
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: `0 0 12px ${theme.palette.primary.main}`,
    },
  },
  videoThumbnail: {
    width: '100%',
    aspectRatio: '16/9', // Garantindo o padrão 16:9
    objectFit: 'cover',
    borderRadius: theme.spacing(1),
  },
  videoTitle: {
    marginTop: theme.spacing(2),
    fontWeight: 600,
    fontSize: '1rem',
    color: theme.palette.text.primary,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  videoDescription: {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
    height: '3em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2, // Limita a 2 linhas
  },
  videoModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoModalContent: {
    outline: 'none',
    width: '90%',
    maxWidth: 1024,
    aspectRatio: '16/9',
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleModalClose = useCallback((event) => {
    if (event.key === "Escape") {
      closeVideoModal();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleModalClose);
    return () => {
      document.removeEventListener("keydown", handleModalClose);
    };
  }, [handleModalClose]);

  const renderVideoModal = () => {
    return (
      <Modal
        open={Boolean(selectedVideo)}
        onClose={closeVideoModal}
        className={classes.videoModal}
      >
        <div className={classes.videoModalContent}>
          {selectedVideo && (
            <iframe
              style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
              src={`https://www.youtube.com/embed/${selectedVideo}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </Modal>
    );
  };

  const renderHelps = () => {
    return (
      <>
        {records.length ? records.map((record, key) => {
          const videoId = record.video.includes("watch?v=")
            ? record.video.split("watch?v=")[1].split("&")[0]
            : record.video;

          return (
            <Paper
              key={key}
              className={classes.helpPaper}
              onClick={() => openVideoModal(videoId)}
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Thumbnail"
                className={classes.videoThumbnail}
              />
              <Typography variant="h6" className={classes.videoTitle}>
                {record.title}
              </Typography>
              <Typography variant="body2" className={classes.videoDescription}>
                {record.description}
              </Typography>
            </Paper>
          );
        }) : null}
      </>
    );
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <MainHeader>
        <Title>{i18n.t("helps.title")} ({records.length})</Title>
        <MainHeaderButtonsWrapper></MainHeaderButtonsWrapper>
      </MainHeader>
      <div className={classes.mainPaperContainer}>
        <div className={classes.mainPaper}>
          {renderHelps()}
        </div>
      </div>
      {renderVideoModal()}
    </MainContainer>
  );
};

export default Helps;
