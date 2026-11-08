import React from 'react';

import { ScrollView, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N } from '../../constants';
import { Modal } from '../../Modal/Modal';
import type { PageSize } from '../utils/pageScale';

const CENTRED_ROW: ViewStyle = { flexGrow: 1, justifyContent: 'center' };

export interface PageOverlayProps {
  children: React.ReactNode;
  pageSize: PageSize;
  visible: boolean;
  onClose: () => void;
  testID: string;
}

/** Shows the page at scale 1 in a dialog; centred, never narrower than its page width; the dialog scrolls when it is larger. */
export const PageOverlay = ({ children, pageSize, visible, onClose, testID }: PageOverlayProps): React.ReactElement => {
  const { t } = useUi();

  return (
    <Modal accessibilityLabel={t(LAYOUT_I18N.pageEnlarge)} size="xl" testID={testID} visible={visible} onClose={onClose}>
      <ScrollView horizontal contentContainerStyle={CENTRED_ROW}>
        <View
          style={{ width: pageSize.width, minWidth: pageSize.width, height: pageSize.height, flexShrink: 0 }}
          testID={`${testID}-page`}
        >
          {children}
        </View>
      </ScrollView>
    </Modal>
  );
};
