import { Button, Typography } from '@strapi/design-system';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { io, Socket } from 'socket.io-client';

import { useMatch, useNavigate } from 'react-router-dom';

import { Modal } from '@strapi/design-system';
import { useAuth, useFetchClient } from '@strapi/strapi/admin';
import { getTranslation } from '../../utils/getTranslation';

const useLockingData = () => {
  const collectionType = useMatch('/content-manager/collection-types/:entityId/:entityDocumentId');
  const singleType = useMatch('/content-manager/single-types/:entityId');
  const user = useAuth('ENTITY_LOCK', (state) => state.user);

  if (!user) return null;

  if (collectionType) {
    return {
      requestData: {
        entityId: collectionType.params.entityId,
        entityDocumentId: collectionType.params.entityDocumentId,
        userId: user.id,
      },
      requestUrl: `/record-locking/get-status/${collectionType.params.entityId}/${collectionType.params.entityDocumentId}`,
    };
  } else if (singleType) {
    return {
      requestData: {
        entityId: singleType.params.entityId,
        userId: user.id,
      },
      requestUrl: `/record-locking/get-status/${singleType.params.entityId}`,
    };
  }

  return null;
};

const useLockStatus = () => {
  const { get } = useFetchClient();
  const lockingData = useLockingData();

  const socket = useRef<Socket | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [settings, setSettings] = useState<{ transports: Array<string> } | null>(null);

  useEffect(() => {
    get('/record-locking/settings').then((response) => {
      setSettings(response.data);
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    if (token && lockingData?.requestData.entityDocumentId !== 'create' && settings) {
      socket.current = io(undefined, {
        reconnectionDelayMax: 10000,
        rejectUnauthorized: false,
        auth: (cb) => {
          cb({
            token: JSON.parse(token),
          });
        },
        transports: settings.transports,
      });
      socket.current.io.on('reconnect', attemptEntityLocking);
      attemptEntityLocking();
    }

    return () => {
      if (lockingData?.requestData.entityDocumentId !== 'create' && settings) {
        socket.current?.emit('closeEntity', lockingData?.requestData);
        socket.current?.close();
      }
    };
  }, [settings]);

  if (!lockingData?.requestUrl) return null;

  const attemptEntityLocking = async () => {
    try {
      const lockingResponse = await get(lockingData.requestUrl);
      if (!lockingResponse.data) {
        socket.current?.emit('openEntity', lockingData?.requestData);
      } else {
        setIsLocked(true);
        setUsername(lockingResponse.data.editedBy);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return {
    isLocked,
    username,
    attemptEntityLocking,
  };
};

export default function EntityLock() {
  const navigate = useNavigate();
  const { formatMessage } = useIntl();
  const lockStatus = useLockStatus();

  if (!lockStatus) return null;

  return (
    lockStatus.isLocked && (
      <Modal.Root defaultOpen={true}>
        <Modal.Content>
          <Modal.Header>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
              {formatMessage({
                id: getTranslation('ModalWindow.CurrentlyEditing'),
                defaultMessage: 'This entry is currently edited',
              })}
            </Typography>
          </Modal.Header>
          <Modal.Body>
            <Typography>
              {formatMessage(
                {
                  id: getTranslation('ModalWindow.CurrentlyEditingBody'),
                  defaultMessage: 'This entry is currently edited by {username}',
                },
                {
                  username: <Typography fontWeight="bold">{lockStatus.username}</Typography>,
                }
              )}
            </Typography>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close>
              <Button variant="tertiary">OK</Button>
            </Modal.Close>
            <Button
              onClick={() => {
                navigate(-1);
              }}
            >
              {formatMessage({
                id: getTranslation('ModalWindow.CurrentlyEditing.Button'),
                defaultMessage: 'Go Back',
              })}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    )
  );
}
