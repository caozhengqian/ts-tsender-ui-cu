"use client"
// import InputForm from "@/components/ui/InputField"
// import {useState} from "react"
import {useState,useMemo} from "react"
import {chainsToTSender,tsenderAbi,erc20Abi} from "@/constants"
import { useChainId, useConfig,useAccount, useWriteContract} from "wagmi"
import {calculateTotal}from "@/utils/calculateTotal/calculateTotal"
import {readContract,waitForTransactionReceipt} from "@wagmi/core"
export default function AirdropForm() {
    const [tokenAddress,setTokenAddress] = useState("")
    const [recipients,setRecipients] = useState("")
    const [amounts,setAmounts] = useState("")
    //第一步：2-1获取当前链
    const chainId = useChainId();
    const config = useConfig();
    //第二步：获取当前账号
    const account = useAccount();
    const total:number = useMemo(()=>calculateTotal(amounts),[amounts])
    const {data:hash,isPending,writeContractAsync} = useWriteContract();
    async function getApprovedAmount(tSenderAddress:string|null):Promise<number>{
        if(!tSenderAddress){
            alert("No address found,please use a supported chain");
            return 0;
        }
        const response = await readContract(config,{
            abi:erc20Abi,
            address:tokenAddress as `0x${string}`,
            functionName:"allowance",
            args:[account.address,tSenderAddress as `0x${string}`]
        });

        return response as number;
    }
    async function handleSubmit(){
        //第一步：2-2获取链接ID对应的的token
        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        console.log('tSenderAddress',tSenderAddress);
        console.log(chainId)
        //第三步：获取授权的金额
        const approvedAmount = await getApprovedAmount(tSenderAddress)
        console.log('approvedAmount',approvedAmount)
        if( approvedAmount < total){
            //第四步：授权额度writeContractAsync和waitForTransactionReceipt
            const approvalHash = await writeContractAsync({
                abi:erc20Abi,
                address:tokenAddress as `0x${string}`,
                functionName:"approve",
                args:[tSenderAddress as `0x${string}`,BigInt(total)]
            })
            const approvalReceipt = await waitForTransactionReceipt(config,{
                hash:approvalHash
            })
            // 第五步：转账
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }else{
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }
    }
    return (
        <div>
            
            <span>Token Address</span>
            <input
            placeholder="0x"
            className="border border-black-500"
            value={tokenAddress}
            onChange={e=>setTokenAddress(e.target.value)}
            /><br/>
            <span>recipients</span>
            <input
            placeholder="0x"
            type="text"
            className="border border-black-500 w-[500px] h-[200px]"
            value={recipients}
            onChange={e=>setRecipients(e.target.value)}
            /><br/>
            <span>amounts</span>
            <input
            placeholder="100"
            className="border border-black-500"
            value={amounts}
            onChange={e=>setAmounts(e.target.value)}
            /><br/>
            <button className="border border-black-500" onClick={handleSubmit}>确认</button>
        </div>
    )
}