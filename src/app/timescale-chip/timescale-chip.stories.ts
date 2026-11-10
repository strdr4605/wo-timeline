import type { Meta, StoryObj } from '@storybook/angular';
import { TimescaleChip } from './timescale-chip';

const meta: Meta<TimescaleChip> = {
  title: 'Timeline/Timescale chip',
  component: TimescaleChip,
  args: {
    value: 'Month',
  },
};

export default meta;

type Story = StoryObj<TimescaleChip>;

export const Closed: Story = {};

/** The menu state is internal, so the story opens it with a click on the chip. */
export const OpenMenu: Story = {
  play: ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('.timescale-chip__value')?.click();
  },
};
