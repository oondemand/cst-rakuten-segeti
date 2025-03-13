import { Box, Button } from "@chakra-ui/react";
import { CloseButton } from "../../components/ui/close-button";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../config/react-query";

import { createDynamicFormFields } from "./formFields";
import { BuildForm } from "../../components/buildForm/index";
import { VisibilityControlDialog } from "../../components/vibilityControlDialog";
import { useVisibleInputForm } from "../../hooks/useVisibleInputForms";
import { toaster } from "../../components/ui/toaster";
import { ServicoService } from "../../service/servico";

import {
  DialogRoot,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

const DefaultTrigger = (props) => {
  return (
    <Button
      {...props}
      size="sm"
      variant="subtle"
      fontWeight="semibold"
      color="brand.500"
      _hover={{ backgroundColor: "gray.50" }}
    >
      Criar um serviço
    </Button>
  );
};

export const ServicosDialog = ({
  defaultValues = null,
  trigger,
  label = "Criar Serviço",
}) => {
  const { inputsVisibility, setInputsVisibility } = useVisibleInputForm({
    key: "SERVICOS",
  });

  const [data, setData] = useState(defaultValues);
  const [open, setOpen] = useState(false);

  const { mutateAsync: updateServicoMutation } = useMutation({
    mutationFn: async ({ id, body }) =>
      await ServicoService.atualizarServico({ id, body }),
    onSuccess(data) {
      setData((prev) => data?.servico);
      queryClient.invalidateQueries(["listar-servicos"]);

      toaster.create({
        title: "Servico atualizado com sucesso",
        type: "success",
      });
    },
    onError: (error) => {
      toaster.create({
        title: "Ouve um erro ao atualizar o serviço",
        type: "error",
      });
    },
  });

  const { mutateAsync: createServicoMutation } = useMutation({
    mutationFn: async ({ body }) => await ServicoService.criarServico({ body }),
    onSuccess(data) {
      setData((prev) => data?.servico);
      queryClient.invalidateQueries(["listar-servicos"]);

      toaster.create({
        title: "Serviço criado com sucesso",
        type: "success",
      });
    },

    onError: (error) => {
      toaster.create({
        title: "Ouve um erro ao criar um serviço",
        type: "error",
      });
    },
  });

  const onSubmit = async (values) => {
    const competencia = values?.competencia.split("/");
    const mes = Number(competencia?.[0]) || null;
    const ano = Number(competencia?.[1]) || null;

    const body = {
      ...values,
      prestador: values.prestador.value,
      competencia: {
        mes,
        ano,
      },
    };

    if (!data) return await createServicoMutation({ body });
    return await updateServicoMutation({ id: data._id, body });
  };

  const fields = useMemo(() => createDynamicFormFields(), []);

  return (
    <Box>
      <Box onClick={() => setOpen(true)} asChild>
        {trigger ? trigger : <DefaultTrigger />}
      </Box>
      {open && (
        <DialogRoot
          size="cover"
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
        >
          <DialogContent w="1250px" h="80%" pt="6" px="2" rounded="lg">
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Box>
                <VisibilityControlDialog
                  fields={fields}
                  setVisibilityState={setInputsVisibility}
                  visibilityState={inputsVisibility}
                  title="Ocultar campos"
                />
                <BuildForm
                  visibleState={inputsVisibility}
                  fields={fields}
                  gridColumns={4}
                  gap={6}
                  data={data}
                  onSubmit={onSubmit}
                />
              </Box>
            </DialogBody>
            <DialogCloseTrigger asChild>
              <CloseButton size="sm" />
            </DialogCloseTrigger>
          </DialogContent>
        </DialogRoot>
      )}
    </Box>
  );
};
