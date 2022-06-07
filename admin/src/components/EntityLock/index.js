import React, { useState, useEffect } from "react";
import {
  ModalLayout,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@strapi/design-system/ModalLayout";
import { io } from "socket.io-client";
import { Button, Typography } from "@strapi/design-system";
import { useIntl } from "react-intl";

import { request, auth } from "@strapi/helper-plugin";
import { useRouteMatch, useHistory } from "react-router-dom";

import { getTrad } from "../../utils/getTrad";

export default function EntityLock() {
  const {
    params: { slug, id },
  } = useRouteMatch("/content-manager/collectionType/:slug/:id");
  const { goBack } = useHistory();

  const { formatMessage } = useIntl();

  const [isLocked, setIsLocked] = useState(false);
  const [username, setUsername] = useState("");

  const { id: userId } = auth.getUserInfo();

  useEffect(() => {
    const socket = io(undefined, {
      reconnectionDelayMax: 10000,
      rejectUnauthorized: false,
    });

    const data = { entityId: id, entitySlug: slug, userId };

    request(`/record-locking/get-status/${id}/${slug}`).then((response) => {
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
            {formatMessage({
              id: getTrad("ModalWindow.CurrentlyEditing"),
              defaultMessage: "This entry is currently edited",
            })}
          </Typography>
        </ModalHeader>
        <ModalBody>
          <Typography>
            {" "}
            {formatMessage({
              id: getTrad("ModalWindow.CurrentlyEditingBody"),
              defaultMessage: "This entry is currently edited by",
            })}
          </Typography>
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
              {formatMessage({
                id: getTrad("ModalWindow.CurrentlyEditing.Button"),
                defaultMessage: "Back",
              })}
            </Button>
          }
        />
      </ModalLayout>
    )
  );
}
