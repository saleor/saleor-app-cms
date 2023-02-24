import { makeStyles } from "@saleor/macaw-ui";
import {
  OffsettedList,
  OffsettedListBody,
  OffsettedListHeader,
  OffsettedListItem,
  OffsettedListItemCell,
} from "@saleor/macaw-ui";
import clsx from "clsx";
import { ChannelFragment } from "../../../../generated/graphql";
import { MergedChannelSchema, SingleChannelSchema } from "../../../lib/cms/config";
import { useChannelSlug } from "../../cms/cms-context";

const useStyles = makeStyles((theme) => {
  return {
    headerItem: {
      height: "auto !important",
      display: "grid",
      gridTemplateColumns: "1fr",
    },
    listItem: {
      cursor: "pointer",
      height: "auto !important",
      display: "grid",
      gridTemplateColumns: "1fr",
    },
    listItemActive: {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    cellSlug: {
      fontFamily: "monospace",
      opacity: 0.8,
    },
  };
});

interface ChannelsListItemsProps {
  channels: MergedChannelSchema[];
  activeChannel?: MergedChannelSchema | null;
  setActiveChannel: (channel: MergedChannelSchema | null) => void;
}

const ChannelsListItems = ({
  channels,
  activeChannel,
  setActiveChannel,
}: ChannelsListItemsProps) => {
  const styles = useStyles();

  return (
    <OffsettedList gridTemplate={["1fr", "1fr"]}>
      <OffsettedListHeader>
        <OffsettedListItem className={styles.headerItem}>
          <OffsettedListItemCell>Channel</OffsettedListItemCell>
        </OffsettedListItem>
      </OffsettedListHeader>
      <OffsettedListBody>
        {channels.map((channel) => {
          return (
            <OffsettedListItem
              onClick={() => setActiveChannel(channel)}
              className={clsx(styles.listItem, {
                [styles.listItemActive]: activeChannel?.channelSlug === channel.channelSlug,
              })}
              key={channel.channelSlug}
            >
              <OffsettedListItemCell>{channel.channel.name}</OffsettedListItemCell>
            </OffsettedListItem>
          );
        })}
      </OffsettedListBody>
    </OffsettedList>
  );
};

export default ChannelsListItems;
