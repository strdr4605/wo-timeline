import type { Meta, StoryObj } from '@storybook/angular';
import { SAMPLE_WORK_ORDER_DOCUMENTS } from '../data/sample-data';
import { WorkOrderDrawer } from './work-order-drawer';

const [editDocument] = SAMPLE_WORK_ORDER_DOCUMENTS;

const meta: Meta<WorkOrderDrawer> = {
  title: 'Timeline/Work order drawer',
  component: WorkOrderDrawer,
  parameters: {
    // The drawer is fixed to the right edge of the page.
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<WorkOrderDrawer>;

export const Create: Story = {
  args: {
    request: {
      mode: 'create',
      workCenterId: editDocument.data.workCenterId,
      startDate: new Date(2026, 10, 5),
    },
  },
};

export const Edit: Story = {
  args: {
    request: { mode: 'edit', order: { docId: editDocument.docId, ...editDocument.data } },
  },
};
