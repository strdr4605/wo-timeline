import type { Meta, StoryObj } from '@storybook/angular';
import { SAMPLE_WORK_ORDER_DOCUMENTS, WorkOrder, WorkOrderStatus } from '../data/sample-data';
import { WorkOrderBar } from './work-order-bar';

const meta: Meta<WorkOrderBar> = {
  title: 'Timeline/Work order bar',
  component: WorkOrderBar,
  // The bar takes its place from the month columns of the grid. The frame gives it one row.
  render: (args) => ({
    props: args,
    template: `
      <div class="story-bar-row">
        <app-work-order-bar [order]="order" [start]="start" [end]="end" />
      </div>
    `,
  }),
  args: {
    start: { index: 0, fraction: 0.5 },
    end: { index: 3, fraction: 0.5 },
  },
};

export default meta;

type Story = StoryObj<WorkOrderBar>;

export const Open: Story = { args: { order: sampleOrder('open') } };

export const InProgress: Story = { args: { order: sampleOrder('in-progress') } };

export const Complete: Story = { args: { order: sampleOrder('complete') } };

export const Blocked: Story = { args: { order: sampleOrder('blocked') } };

/** The first order of the sample data with the status. The sample data has all four. */
function sampleOrder(status: WorkOrderStatus): WorkOrder {
  const document = SAMPLE_WORK_ORDER_DOCUMENTS.find((item) => item.data.status === status)!;
  return { docId: document.docId, ...document.data };
}
