import React, { useState, useEffect, useRef } from "react";
import {
  ModalLayout,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "@strapi/design-system/ModalLayout";
import { io } from "socket.io-client";
import { Button, Typography } from "@strapi/design-system";
import { useIntl } from "react-intl";

import { useFetchClient, auth } from "@strapi/helper-plugin";
import { useRouteMatch, useHistory } from "react-router-dom";

import getTrad from "../../utils/getTrad";

export default function EntityLock() {
  const collectionType = useRouteMatch(
    "/content-manager/collection-types/:slug/:id"
  );
  const singleType = useRouteMatch("/content-manager/single-types/:slug");
  const { get } = useFetchClient();

  let params, statusUrl;
  if (collectionType) {
    params = collectionType.params;
    statusUrl = `/record-locking/get-status/${params.id}/`;
  } else {
    params = singleType.params;
    statusUrl = `/record-locking/get-status/`;
  }
  const { id, slug } = params;
  statusUrl += slug;

  const { goBack } = useHistory();

  const { formatMessage } = useIntl();

  const [isLocked, setIsLocked] = useState(false);
  const [username, setUsername] = useState("");
  const [settings, setSettings] = useState(null);

  const socket = useRef({});

  const { id: userId } = auth.get("userInfo");
  const lockingData = { entityId: id, entitySlug: slug, userId };

  const attemptLocking = () => {
    try {
      get(statusUrl).then((response) => {
        if (!response.data) {
          socket.current?.emit("openEntity", lockingData);
        } else {
          setIsLocked(true);
          setUsername(response.data.editedBy);
        }
      });
    } catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    get("/record-locking/settings/").then((response) => {
      setSettings(response);
    });
  }, []);

  useEffect(() => {
    if (id !== "create" && settings) {
      socket.current = io(undefined, {
        reconnectionDelayMax: 10000,
        rejectUnauthorized: false,
        auth: (cb) => {
          cb({
            token:
              JSON.parse(localStorage.getItem("jwtToken")) ??
              JSON.parse(sessionStorage.getItem("jwtToken")),
          });
        },
        transports: settings.transports,
      });
      socket.current.io.on("reconnect", attemptLocking);

      attemptLocking();
    }

    return () => {
      if (id !== "create" && settings) {
        socket.current.emit("closeEntity", lockingData);
        socket.current.close();
      }
    };
  }, [settings]);

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
            {formatMessage(
              {
                id: getTrad("ModalWindow.CurrentlyEditingBody"),
                defaultMessage: "This entry is currently edited by",
              },
              {
                username: <Typography fontWeight="bold">{username}</Typography>,
              }
            )}
          </Typography>
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
