import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@strapi/design-system/ModalLayout";
import { io } from "socket.io-client";
import { Button, Typography } from "@strapi/design-system";

import { request, auth } from "@strapi/helper-plugin";
import { useRouteMatch, useHistory } from "react-router-dom";

export default function EntityLock() {
  const {
    params: { slug, id },
  } = useRouteMatch("/content-manager/collectionType/:slug/:id");
  const { goBack } = useHistory();

  const [isLocked, setIsLocked] = useState(false);
  const [username, setUsername] = useState("");

  const { id: userId } = auth.getUserInfo();

  useEffect(() => {
    const socket = io(undefined, {
      reconnectionDelayMax: 10000,
      rejectUnauthorized: false
    });

    const data = { entityId: id, entitySlug: slug, userId };

    request(`/entity-lock/get-status/${id}/${slug}`).then((response) => {
      if (!response) {
        socket.emit("openEntity", data);
      } else {
        setIsLocked(true);
        setUsername(response.editedBy);
      }
    });

    return () => {
      socket.emit("closeEntity", data);
      socket.close();
    };
  }, []);

  return (
    isLocked && (
      <ModalLayout
        onClose={() => {
          goBack();
        }}
        labelledBy="title"
      >
        <ModalHeader>
          <Typography
            fontWeight="bold"
            textColor="neutral800"
            as="h2"
            id="title"
          >
            Tento záznam je právě editován
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography>Stránka je aktuálně editovaná uživatelem </Typography>
          <Typography fontWeight="bold">{username}</Typography>
        </ModalBody>
        <ModalFooter
          startActions={
            <Button
              onClick={() => {
                goBack();
              }}
              variant="tertiary"
            >
              Zpět
            </Button>
          }
        />
      </ModalLayout>
    )
  );
}
