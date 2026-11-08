import React from 'react';

import { ScrollView, View } from 'react-native';

import { useUi } from '@dloizides/ui-feedback';

import { LAYOUT_I18N } from '../../constants';
import { Modal } from '../../Modal/Modal';
import type { PageSize } from '../utils/pageScale';

export interface PageOverlayProps {
  children: React.ReactNode;
  pageSize: PageSize;
  visible: boolean;
  onClose: () => void;
  testID: string;
}

/** Shows the page at scale 1 in a dialog; the dialog scrolls when the page is taller or wider than the viewport. */
export const PageOverlay = ({ children, pageSize, visible, onClose, testID }: PageOverlayProps): React.ReactElement => {
  const { t } = useUi();

  return (
    <Modal accessibilityLabel={t(LAYOUT_I18N.pageEnlarge)} size="xl" testID={testID} visible={visible} onClose={onClose}>
      <ScrollView horizontal>
        <View style={{ width: pageSize.width, height: pageSize.height }} testID={`${testID}-page`}>
          {children}
        </View>
      </ScrollView>
    </Modal>
  );
};
