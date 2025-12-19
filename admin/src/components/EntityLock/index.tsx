import { Button, Typography, Flex } from '@strapi/design-system';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { io, Socket } from 'socket.io-client';

import { useMatch, useNavigate } from 'react-router-dom';

import { Modal } from '@strapi/design-system';
import { useAuth, useFetchClient } from '@strapi/strapi/admin';
import { getTranslation } from '../../utils/getTranslation';
import { getStoredToken } from '../../utils/getStoredToken';

const useLockingData = () => {
  const collectionType = useMatch('/content-manager/collection-types/:entityId/:entityDocumentId');
  const singleType = useMatch('/content-manager/single-types/:entityId');
  const cloneCollectionType = useMatch('/content-manager/collection-types/:entityId/clone/:entityDocumentId');
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
  } else if (cloneCollectionType) {
    return {
      requestData: {
        entityId: cloneCollectionType.params.entityId,
        entityDocumentId: cloneCollectionType.params.entityDocumentId,
        userId: user.id,
      },
      requestUrl: `/record-locking/get-status/${cloneCollectionType.params.entityId}/${cloneCollectionType.params.entityDocumentId}`,
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
  const [settings, setSettings] = useState<{ transports: Array<string>, showOKButtonToIgnoreLockWarning: boolean, showTakeoverButton: boolean, include: string[] | undefined, exclude: string[] | undefined } | null>(null);
  const [isTakenOver, setIsTakenOver] = useState<boolean>(false);

  const isCollectionLockable = (entityId: string) => settings?.include !== undefined ? settings.include.includes(entityId) : settings?.exclude !== undefined ? !settings.exclude.includes(entityId) : true;

  useEffect(() => {
    get('/record-locking/settings').then((response) => {
      setSettings(response.data);
    });
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token && lockingData && lockingData?.requestData.entityDocumentId !== 'create' && settings
      && lockingData?.requestData.entityId
    ) {
        get(`/record-locking/is-collection-lockable/${lockingData?.requestData.entityId}`).then((response) => {
          if (response.data) {
            socket.current = io(undefined, {
              reconnectionDelayMax: 10000,
              rejectUnauthorized: false,
              auth: (cb) => {
                cb({token});
              },
              transports: settings.transports,
            });
            socket.current.io.on('reconnect', attemptEntityLocking);
            socket.current.on('takeoverEntityPerformed', (data: { entityDocumentId: string, entityId: string, username: string }) => { 
              if (lockingData?.requestData.entityDocumentId === data.entityDocumentId && lockingData?.requestData.entityId === data.entityId) {
                setIsLocked(true);
                setUsername(data.username);
                setIsTakenOver(true);
              }
            });
            attemptEntityLocking();
          }
        });
    }

    return () => {
      if (token && lockingData?.requestData.entityDocumentId !== 'create' && settings
        && (lockingData?.requestData.entityId && isCollectionLockable(lockingData?.requestData.entityId))) {
        socket.current?.off('takeoverEntityPerformed');
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

  const takeoverEntityLock = () => {
    socket.current?.emit('takeoverEntity', lockingData?.requestData, (response: { success: boolean, error?: string }) => {
        if (response.success) {
          setIsLocked(false);
          setUsername('');
          setIsTakenOver(false);
        } else {
          console.warn(response.error);
        }
    });
  };

  return {
    isLocked,
    username,
    attemptEntityLocking,
    takeoverEntityLock,
    isTakenOver,
    settings,
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
                  id: lockStatus.isTakenOver ? getTranslation('ModalWindow.CurrentlyTakenOverBody') : getTranslation('ModalWindow.CurrentlyEditingBody'),
                  defaultMessage: lockStatus.isTakenOver ? 'This entry is taken over for editing by {username}' : 'This entry is currently edited by {username}',
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
            <Flex gap={2} direction="row">
              {
                (lockStatus.settings?.showTakeoverButton ?? false) && (
                  <Button
                  onClick={lockStatus.takeoverEntityLock}
                >
                  {formatMessage({
                    id: getTranslation('ModalWindow.TakeoverCurrentlyEditing.Button'),
                    defaultMessage: 'Takeover',
                  })}
                </Button>
                )
              }
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
            </Flex>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    )
  );
}
