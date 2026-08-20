import React, { createContext, useContext } from 'react';
import * as z from 'zod/v4';

import { Avatar, AvatarPropsSchema } from '@push-labs/block-avatar';
import { Button, ButtonPropsSchema } from '@push-labs/block-button';
import { Divider, DividerPropsSchema } from '@push-labs/block-divider';
import { Heading, HeadingPropsSchema } from '@push-labs/block-heading';
import { Html, HtmlPropsSchema } from '@push-labs/block-html';
import { Image, ImagePropsSchema } from '@push-labs/block-image';
import { Spacer, SpacerPropsSchema } from '@push-labs/block-spacer';
import { Text, TextPropsSchema } from '@push-labs/block-text';
import {
  buildBlockComponent,
  buildBlockConfigurationDictionary,
  buildBlockConfigurationSchema,
} from '@push-labs/document-core';

import ColumnsContainerPropsSchema from '../blocks/ColumnsContainer/ColumnsContainerPropsSchema';
import ColumnsContainerReader from '../blocks/ColumnsContainer/ColumnsContainerReader';
import { ContainerPropsSchema } from '../blocks/Container/ContainerPropsSchema';
import ContainerReader from '../blocks/Container/ContainerReader';
import { EmailLayoutPropsSchema } from '../blocks/EmailLayout/EmailLayoutPropsSchema';
import EmailLayoutReader from '../blocks/EmailLayout/EmailLayoutReader';

const ReaderContext = createContext<TReaderDocument>({});

function useReaderDocument() {
  return useContext(ReaderContext);
}

const READER_DICTIONARY = buildBlockConfigurationDictionary({
  ColumnsContainer: {
    schema: ColumnsContainerPropsSchema,
    Component: ColumnsContainerReader,
  },
  Container: {
    schema: ContainerPropsSchema,
    Component: ContainerReader,
  },
  EmailLayout: {
    schema: EmailLayoutPropsSchema,
    Component: EmailLayoutReader,
  },
  //
  Avatar: {
    schema: AvatarPropsSchema,
    Component: Avatar,
  },
  Button: {
    schema: ButtonPropsSchema,
    Component: Button,
  },
  Divider: {
    schema: DividerPropsSchema,
    Component: Divider,
  },
  Heading: {
    schema: HeadingPropsSchema,
    Component: Heading,
  },
  Html: {
    schema: HtmlPropsSchema,
    Component: Html,
  },
  Image: {
    schema: ImagePropsSchema,
    Component: Image,
  },
  Spacer: {
    schema: SpacerPropsSchema,
    Component: Spacer,
  },
  Text: {
    schema: TextPropsSchema,
    Component: Text,
  },
});

export const ReaderBlockSchema = buildBlockConfigurationSchema(READER_DICTIONARY);
export type TReaderBlock = z.infer<typeof ReaderBlockSchema>;

export const ReaderDocumentSchema = z.record(z.string(), ReaderBlockSchema);
export type TReaderDocument = Record<string, TReaderBlock>;

const BaseReaderBlock = buildBlockComponent(READER_DICTIONARY);

export type TReaderBlockProps = { id: string };
export function ReaderBlock({ id }: TReaderBlockProps) {
  const document = useReaderDocument();
  return <BaseReaderBlock {...document[id]} />;
}

export type TReaderProps = {
  document: Record<string, z.infer<typeof ReaderBlockSchema>>;
  rootBlockId: string;
};
export default function Reader({ document, rootBlockId }: TReaderProps) {
  return (
    <ReaderContext.Provider value={document}>
      <ReaderBlock id={rootBlockId} />
    </ReaderContext.Provider>
  );
}
